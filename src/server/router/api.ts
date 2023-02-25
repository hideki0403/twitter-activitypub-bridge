import Router from '@koa/router'
import activitypub from '@/services/activitypub'
import { queueDeliver as deliver } from '@/queue'
import database from '@/database'
import * as DBTypes from '@/database/types'
import twitter from '@/services/twitter'
import { IActor } from '@/services/activitypub/types'
import config from '@/config'

export async function deleteUser(ctx: Router.RouterContext) {
    const id = ctx.params.id
    if (!id || typeof id === 'object') {
        ctx.body = 'invalid id'
        return
    }

    const twitterUser = await twitter.getBaseUser(id, 'screen_name', false)

    if (!twitterUser) {
        ctx.body = 'twitter: user not found'
        return
    }

    // 削除チェック
    if (await twitter.isDeleted(twitterUser.id_str)) {
        ctx.body = 'this user has already been deleted'
        return
    }

    // 公式アカウントのみ配信するように設定されている場合は公式アカウントの削除が出来ないようにする（暫定）
    if (config.onlyVerifiedAccount && twitterUser.verified) {
        ctx.body = 'this user is can not delete'
        return
    }

    // アクティビティを配信すべきユーザーを取得
    const users = await database.get<DBTypes.IFollowingList>('followingList', {
        target: twitterUser.id_str
    })

    if (users) {
        const sharedInboxes: string[] = []
        for (const user of users) {
            const remoteUser = await database.getOne<DBTypes.IRemoteUser>('remoteUser', {
                id: user.source
            })
            if (!remoteUser) continue

            const sharedInbox = remoteUser.user.sharedInbox ?? remoteUser.user.endpoints?.sharedInbox
            if (!sharedInbox || sharedInboxes.includes(sharedInbox)) continue

            sharedInboxes.push(sharedInbox)
        }

        // 全てのsharedInboxにdeleteアクティビティを送信する
        sharedInboxes.forEach(async sharedInbox => {
            const activity = activitypub.deliver.deletes(await activitypub.users.user(twitterUser))
            const actor = { sharedInbox } as IActor
            deliver(actor, activity, twitterUser.id_str)
        })
    }

    // データベースに削除したことを記録する
    const upsertObject = {
        uid: twitterUser.id_str,
        updatedAt: Date.now()
    }

    await database.upsertOne('deletedTwitterUser', { uid: twitterUser.id_str }, upsertObject)

    // データベースのfollowingListから対象ユーザーに関するフォロー情報を削除する
    await database.deleteMany('followingList', { target: twitterUser.id_str })

    ctx.body = `success to send delete activity to ${sharedInboxes.length} instance(s)`
    return
}