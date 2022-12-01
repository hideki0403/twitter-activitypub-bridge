import database from '@/database'
import * as DBTypes from '@/database/types'

export async function get(key: string, withUpdatedAt = false) {
    const state = await database.getOne<DBTypes.IStore>('store', { key })
    if (!state) return null

    if (withUpdatedAt) return state

    return state.value
}

export async function set(key: string, value: any) {
    const upsertObject = {
        key,
        value,
        updatedAt: Date.now()
    } as DBTypes.IStore
    
    await database.upsertOne('store', { key }, upsertObject)
}