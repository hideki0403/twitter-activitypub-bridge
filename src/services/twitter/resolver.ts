import db from '@/database'
import * as DBTypes from '@/database/types'
import twitter from './'

// ActivityPubの仕様としてユーザーのIDは一意である必要があるため、ユーザーを初観測した際にIDを登録し、以後のID解決に利用する
// しかしながら、観測したユーザーが観測後にIDを変更し、そのIDを第三者が使用した場合や、既に観測しているユーザーを新しいIDでアカウント検索をした際に正常に解決ができなくなるため、解決策が必要

export default async function idResolver(uid: string) {
    // 既にデータベース上に登録されていればそれを返す
    const item = await db.getOne<DBTypes.ITwitterIDTable>('twitterIdTable', { uid })
    if (item) return item.screen_name

    // データベース上に登録されていなければUIDからscreen_nameを取得する
    const user = await twitter.getUser(uid, 'uid')
    if (!user) return null

    // データベースに登録
    const upsertObject = {
        uid,
        screen_name: user.screen_name,
        updatedAt: Date.now()
    } as DBTypes.ITwitterIDTable
    await db.upsertOne('twitterIdTable', { uid }, upsertObject)

    // screen_nameを返す
    return user.screen_name
}