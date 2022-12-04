import Bull from 'bull'
import twitter from '@/services/twitter'
import db from '@/database'
import { ListStatusesV1Params } from 'twitter-api-v2'
import activityPub from '@/services/activitypub'
import * as DBTypes from '@/database/types'
import { queueDeliver as deliver } from '@/queue'
import remote from '@/services/remote'
import utils from '@/utils'

const logger = utils.logger.getLogger('queue:twitter')
const client = twitter.client
const list = twitter.list

// リストからツイートをポーリングする
export default async function () {
    // リストが初期化されていなければ中断
    if (!list.isInitialized) return log('interrupt: list is not initialized')
    
    // リストを取得
    const lists = list.get()

    // 時間をベースにindexを作成
    // 5秒おきに実行しているので Date.now() / 1000 から更に5で割っている
    // 利用人数が多くなってきたら詰まりそうなのでスケーラブルにしたい
    const index = Math.floor(Date.now() / 1000 / 5) % lists.length

    // リストからツイートを取得
    const targetList = lists[index]

    // since_idを取得
    const listState = await db.getOne<DBTypes.IListStates>('listStates', { id: targetList.id_str })
    const sinceId = listState ? listState.lastTweetId : null

    // ツイートを取得
    // もしsince_idがなければcountを1にして実行 (そうしないと直近200件のツイートをぶちまけてしまう)
    const listOptions = {
        list_id: targetList.id_str,
        count: sinceId ? 200 : 1,
        include_rts: true,
    } as ListStatusesV1Params

    if (sinceId) listOptions['since_id'] = sinceId

    const tweetsPaginator = await client.v1.listStatuses(listOptions).catch(e => {
        log(`error: ${e}`)
        return null
    })

    if (tweetsPaginator === null) throw log('error: failed to get tweets')

    // paginatorからツイートを取り出す
    // new -> old の順になっているのでreverseする
    const tweets = tweetsPaginator.tweets.reverse()

    // もしツイートがなければ終了
    if (!tweets.length) return

    // ツイートを処理
    for (const tweet of tweets) {
        // データベースに登録
        await twitter.insertTweet(tweet.id_str, tweet)

        // ツイートをオブジェクトに変換
        const note = !tweet.retweeted_status ? activityPub.deliver.create(await activityPub.notes.note(tweet)) : await activityPub.notes.renote(tweet)

        // 変換に失敗したらcontinue
        if (note === null) continue

        // オブジェクトを配信すべきユーザーを取得
        const users = await db.get<DBTypes.IFollowingList>('followingList', { 
            target: tweet.user.id_str
        })

        users?.forEach(async user => {
            // ユーザーを解決
            const remoteUser = await remote.getRemoteUser(user.source)
            if (remoteUser) {
                // ユーザーに配信
                deliver(remoteUser, note, tweet.user.id_str)
            }
        })
    }

    const upsertObject = {
        id: targetList.id_str,
        lastTweetId: tweets[tweets.length - 1].id_str,
        updatedAt: Date.now()
    } as DBTypes.IListStates

    await db.upsertOne('listStates', { id: targetList.id_str }, upsertObject)
    return log(`success: processed ${tweets.length} tweet(s)`, 'trace')
}

function log(message: string, type?: 'info' | 'trace' | 'debug') {
    if (type) {
        logger[type](message)
    } else {
        message.includes('error') ? logger.error(message) : logger.debug(message)
    }

    return message
}