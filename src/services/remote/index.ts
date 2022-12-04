import db from '@/database'
import * as resolver from './resolver'
import * as ignore from './ignore'
import * as DBTypes from '@/database/types'
import utils from '@/utils'

const logger = utils.logger.getLogger('remote')

async function getRemoteUser(url: string, forceFetch = false) {
    const cachedUser = await db.getOne<DBTypes.IRemoteUser>('remoteUser', { id: url })

    const CACHE_LIMIT = 1000 * 60 * 60 * 24 * 30 // 1 month
    if (cachedUser && (Date.now() - cachedUser.updatedAt) < CACHE_LIMIT && !forceFetch) {
        return cachedUser.user
    }

    const user = await resolver.getRemoteUser(url)
    if (!user) return null

    // 正しいユーザーか検証
    if (!user.type || !['Person', 'Service'].includes(user.type)) {
        logger.debug(`Invalid actor type: ${user.type} / ${url}`)
        return null
    }

    if (!user.inbox && !user.sharedInbox) {
        logger.debug(`Inbox not found: ${url}`)
        return null
    }

    if (!user.publicKey || !user.publicKey.publicKeyPem) {
        logger.debug(`Public key not found: ${url}`)
        return null
    }

    const insertObject = {
        user: user,
        id: user.id,
        updatedAt: Date.now()
    } as DBTypes.IRemoteUser

    db.upsertOne('remoteUser', { id: url }, insertObject)

    return user
}

export default {
    getRemoteUser,
    isIgnoreUser: ignore.isIgnoreUser
}