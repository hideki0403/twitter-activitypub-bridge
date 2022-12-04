import httpSignature from '@peertube/http-signature'
import * as Types from './types'
import twitter from '@/services/twitter'
import remote from '@/services/remote'
import activitypub from '@/services/activitypub'
import { queueDeliver as deliver } from '@/queue'
import utils from '@/utils'

const logger = utils.logger.getLogger('ap:inbox')

export async function inbox(signature: httpSignature.IParsedSignature, activity: Types.IActivity) {
    const target = typeof activity.actor === 'string' ? activity.actor : activity.actor.id 
    if (!target) return logger.debug('interrupt: actor is not found')

    logger.trace(`Received activity: ${activity.type} from ${target}`)

    // リモートのユーザーを取得
    const remoteUser = await remote.getRemoteUser(target)
    if (!remoteUser || !remoteUser.publicKey?.publicKeyPem) return logger.debug('interrupt: remote user is not found')

    // 署名チェック
    const isVaridatedSignature = httpSignature.verifySignature(signature, remoteUser.publicKey.publicKeyPem)
    if (!isVaridatedSignature || target !== remoteUser.id) return logger.debug(`interrupt: invalid signature: ${target}`)

    // follow
    if (activity.type === 'Follow') {
        // ブロック対象のユーザー/インスタンスか検証
        if (remote.isIgnoreUser(remoteUser)) return logger.debug('interrupt: remote user is ignored')
        
        const user = await getTwitterUserFromID(activity)
        // アカウントが見つからなかった or 鍵垢なら何もせずにそのまま終了
        if (!user || user.protected) return logger.debug('interrupt: twitter user is not found or protected')

        // フォロー
        const isSuccess = await twitter.followUser(remoteUser.id, user)

        // Accept or Reject
        const buildActivity = isSuccess ? activitypub.utils.acceptFollow(activity, user.id_str) : activitypub.utils.rejectFollow(activity, user.id_str)
        deliver(remoteUser, buildActivity, user.id_str)
    }

    // unfollow
    if (activity.type === 'Undo' && typeof activity.object === 'object' && activity.object.type === 'Follow') {
        const user = await getTwitterUserFromID(activity)
        // アカウントが見つからなかったら終了
        if (!user) return

        // フォロー解除
        await twitter.unfollowUser(remoteUser.id, user)
    }
}

async function getTwitterUserFromID(activity: Types.IActivity) {
    // 対象ユーザーのIDを指定
    const targetUid = getUidRecursive(activity.object)
    if (!targetUid) return null

    // ユーザー取得
    const user = await twitter.getUser(targetUid.replace(/.*\/users\//g, ''), 'uid')
    if (!user) return null

    return user
}

function getUidRecursive(target: string | Types.IObject): string | null {
    if (typeof target === 'string') return target
    if (target.object) return getUidRecursive(target.object)
    return null
}