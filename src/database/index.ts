import Instance from './instance'
import * as Types from './types'

async function getOne<T>(collection: Types.allowedTableName, key: Object): Promise<T | null> {
    const result = await Instance.db.collection(collection).findOne(key)
    if (!result || !Object.keys(result).length) return null
    return result as T
}

async function get<T>(collection: Types.allowedTableName, key: Object): Promise<T[] | null> {
    const result = await Instance.db.collection(collection).find(key).toArray()
    if (!result || !result.length) return null
    return result as T[]
}

async function upsertOne(collection: Types.allowedTableName, key: Object, value: Object): Promise<void> {
    await Instance.db.collection(collection).updateOne(key, { $set: value }, { upsert: true })
}

async function deleteOne(collection: Types.allowedTableName, key: Object): Promise<void> {
    await Instance.db.collection(collection).deleteOne(key)
}

async function deleteMany(collection: Types.allowedTableName, key: Object): Promise<void> {
    await Instance.db.collection(collection).deleteMany(key)
}

export default {
    getOne,
    get,
    upsertOne,
    deleteOne,
    deleteMany,
    manager: Instance
}