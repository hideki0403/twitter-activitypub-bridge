import db from '@/database'
import * as resolver from './resolver'
import * as DBTypes from '@/database/types'

async function getRemoteUser(url: string, forceFetch = false) {
    const cachedUser = await db.getOne<DBTypes.IRemoteUser>('remoteUser', { id: url })

    const CACHE_LIMIT = 1000 * 60 * 60 * 24 * 30 // 1 month
    if (cachedUser && (Date.now() - cachedUser.updatedAt) < CACHE_LIMIT && !forceFetch) {
        return cachedUser.user
    }

    const user = await resolver.getRemoteUser(url)
    if (!user) return null

    const insertObject = {
        user: user,
        id: user.id,
        updatedAt: Date.now()
    } as DBTypes.IRemoteUser

    db.upsertOne('remoteUser', { id: url }, insertObject)

    return user
}

export default {
    getRemoteUser
}