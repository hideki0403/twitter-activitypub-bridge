import { MongoClient } from 'mongodb'
import config from '@/config'
import utils from '@/utils'
const MONGODB_URI = `mongodb://${config.db.host}:${config.db.port}`
const logger = utils.logger.getLogger('database')

// make singleton instance
export default class Database {
    private constructor() { }

    private static _client: MongoClient | null = null

    public static async initialize() {
        if (!this._client) {
            const mongo = new MongoClient(MONGODB_URI)
            const client = await mongo.connect()
            this._client = client

            logger.info('Database connected')
        }
    }

    public static get db() {
        if (!this._client) {
            throw new Error('Database not connected')
        }

        return this._client.db(config.db.name)
    }
}