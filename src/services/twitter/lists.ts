import client from './client'
import { ListV1 } from 'twitter-api-v2'
import utils from '@/utils'
import config from '@/config'

const logger = utils.logger.getLogger('twitter:manager')

export default class ListManager {
    private static _instance: ListManager
    private constructor() {
        this.reload().then(() => logger.debug('List initialized'))
    }

    private lists: ListV1[] = []
    private initialized = false

    // singleton
    public static get instance() {
        if (!this._instance) {
            this._instance = new ListManager()
        }
        return this._instance
    }

    public get isInitialized() {
        return this.initialized
    }

    // watcherのアカウントにあるリストを再読み込みする
    public async reload(force = false) {
        this.lists = []

        // キャッシュがあればそっちから拾う
        const cachedLists = await utils.store.get('lists', true)
        const CACHE_LIMIT = 1000 * 60 * 5 // 5分
        if (cachedLists && (Date.now() - cachedLists.updatedAt) < CACHE_LIMIT && !force) {
            this.lists = cachedLists.value
            this.initialized = true
            logger.debug('List loaded from cache')
            return
        }

        // リストを取得
        const rawLists = await client.v1.lists().catch(e => {
            logger.error(e)
            return []
        })

        rawLists.forEach(list => {
            // リスト名がprefixから始まるものが対象
            if (list.name.startsWith(config.twitter.list_prefix)) this.lists.push(list)
        })
        
        // initializeフラグをtrueにしておく
        this.initialized = true
        logger.trace('List loaded from api')

        // キャッシュを更新
        await utils.store.set('lists', this.lists)
    }

    // リストを返す
    public get() {
        return this.lists
    }

    // リストにユーザーを追加する
    // return(bool | str): 成功したらリスト名, 失敗したらfalseを返す
    public async follow(uid: string): Promise<boolean | string> {
        // 初期化が完了していなければfalseを返す
        if (!this.initialized) return false

        // リストの中から最もユーザー数が少ないものを選択
        const list = this.lists.length ? this.lists.reduce((prev, current) => {
            return prev.member_count < current.member_count ? prev : current
        }) : null

        // リストが見つからない or リストにこれ以上ユーザーを追加できなければ新しいリストを作成
        if (!list || list.member_count >= 5000) {
            const result = await this.createList()
            if (!result) return false

            // リストの再読み込みとかしてるので初めからやり直し
            return await this.follow(uid)
        }

        // リストにユーザーを追加
        const result = await client.v1.addListMembers({
            list_id: list.id_str,
            user_id: uid
        }).then(() => true).catch(e => {
            logger.error(e)
            return false
        })

        if (result) logger.info(`Add user ${uid} to list ${list.name}`)

        return result ? list.slug : false
    }

    // リストを作成する
    // return(bool): 成功したかどうか
    private async createList(): Promise<boolean> {
        // 最新のリスト番号を取得
        const latestList = this.lists.length ? this.lists.reduce((prev, current) => {
            const prevNumber = parseInt(prev.name.replace(config.twitter.list_prefix, ''))
            const currentNumber = parseInt(current.name.replace(config.twitter.list_prefix, ''))
            return prevNumber > currentNumber ? prev : current
        }) : null
        const latestNumber = latestList ? parseInt(latestList.name.replace(config.twitter.list_prefix, '')) : 0
        
        // リストで使用する番号
        // latestNumberがNaNなら1, そうでなければlatestNumber+1を使用する
        const useNumber = isNaN(latestNumber) ? 1 : latestNumber + 1

        // 作成
        const list = await client.v1.createList({
            name: `${config.twitter.list_prefix}${useNumber}`,
            mode: 'private',
            description: `Twitter ActivityPub Bridge: ${useNumber}, created at ${new Date().toISOString()}`
        }).catch(e => {
            logger.error(e)
            return null
        })

        // 失敗したらfalseを返して終わり
        if (!list) return false

        logger.info(`Created new list: ${list.name}`)

        // 成功したためリストを再読み込みしてtrueを返す
        await this.reload(true)
        return true
    }
}
