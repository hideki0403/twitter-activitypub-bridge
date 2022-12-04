import db from '@/database'
import * as DBTypes from '@/database/types'
import twitter from './'
import randomstring from 'randomstring'

export default async function idResolver(uid: string): Promise<string | null> {
    // 既にデータベース上に登録されていればそれを返す
    const item = await db.getOne<DBTypes.ITwitterIDTable>('twitterIdTable', { uid })
    if (item) return item.screen_name

    // データベース上に登録されていなければUIDからscreen_nameを取得する
    const user = await twitter.getUser(uid)
    if (!user) return null

    // ランダムな文字列を生成し、screen_nameの後ろに付ける
    const rand = randomstring.generate({
        length: 4,
        capitalization: 'lowercase'
    })

    const screen_name = `${user.screen_name}_${rand}`

    // 既にデータベースに存在していれば再試行
    const check = await db.getOne<DBTypes.ITwitterIDTable>('twitterIdTable', { screen_name })
    if (check) return idResolver(uid)

    // データベースに登録
    const upsertObject = {
        uid,
        screen_name,
        updatedAt: Date.now()
    } as DBTypes.ITwitterIDTable
    await db.upsertOne('twitterIdTable', { uid }, upsertObject)

    // screen_nameを返す
    return screen_name
}