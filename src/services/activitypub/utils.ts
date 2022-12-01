import db from '@/database'
import * as DBTypes from '@/database/types'
import * as APTypes from '@/services/activitypub/types'
import crypto from 'crypto'
import config from '@/config'

export async function getUserKeypair(uid: string) {
    const keypair = await db.getOne<DBTypes.ITwitterUserKeypair>('twitterUserKeypair', { uid })
    if (keypair) return keypair

    return await createUserKeypair(uid)
}

export async function createUserKeypair(uid: string) {
    const keypair = await new Promise((resolve, reject) => {
        crypto.generateKeyPair('rsa', {
            modulusLength: 4096,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        }, (err, publicKey, privateKey) => {
            err ? resolve(null) : resolve([publicKey, privateKey])
        })
    }) as [string, string] | null

    if (!keypair) return null

    const upsertObject = {
        uid,
        publicKey: keypair[0],
        privateKey: keypair[1]
    }

    await db.upsertOne('twitterUserKeypair', { uid }, upsertObject)

    return upsertObject as DBTypes.ITwitterUserKeypair
}

export function acceptFollow(activity: APTypes.IActivity, actor: string) {
    const object = activity as any

    if (object['@context']) delete object['@context']

    return {
        '@context': 'https://www.w3.org/ns/activitystreams',
        type: 'Accept',
        actor: `${config.url}/users/${actor}`,
        object
    }
}

export function rejectFollow(activity: APTypes.IActivity, actor: string) {
    const object = activity as any

    if (object['@context']) delete object['@context']

    return {
        '@context': 'https://www.w3.org/ns/activitystreams',
        type: 'Reject',
        actor: `${config.url}/users/${actor}`,
        object
    }
}