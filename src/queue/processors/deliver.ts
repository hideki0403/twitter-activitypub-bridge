import Bull from 'bull'
import * as Types from '../types'
import crypto from 'crypto'
import config from '@/config'
import activitypub from '@/services/activitypub'
import * as utilTypes from '@/utils/types'
import utils from '@/utils'
const logger = utils.logger.getLogger('queue:deliver')

export default async function(job: Bull.Job<Types.deliverQueue>) {
    const activity = JSON.stringify(job.data.activity)
    const signer = await activitypub.utils.getUserKeypair(job.data.actorId)
    if (!signer) return log('fail: signer not found')

    const signedHeaders = createSignature(job.data.to, activity, signer.privateKey, job.data.actorId)

    const response = await fetch(job.data.to, {
        method: 'POST',
        headers: Object.assign({
            'Content-Type': 'application/activity+json'
        }, signedHeaders),
        body: activity
    })

    if (response.ok) {
        return log(`completed (to: ${job.data.to})`)
    }

    if (response.status >= 500) {
        throw log(`fail: remote server error (code: ${response.status}, to: ${job.data.to})`)
    }

    return log(`fail: client error (code: ${response.status}, to: ${job.data.to})`)
}

function createSignature(rawUrl: string, body: string, privateKey: string, actorId: string) {
    const url = new URL(rawUrl)
    const digestHeader = `SHA-256=${crypto.createHash('sha256').update(body).digest('base64')}`

    const headers = {
        '(request-target)': `post ${url.pathname}`,
        'host': url.host,
        'date': new Date().toUTCString(),
        'digest': digestHeader,
    } as utilTypes.KVPair

    const arrayedHeaders = Object.keys(headers).map(key => `${key}: ${headers[key]}`)

    const signature = crypto.sign('sha256', Buffer.from(arrayedHeaders.join('\n')), privateKey).toString('base64')
    const signatureHeader = `keyId="${config.url}/users/${actorId}#main-key",algorithm="rsa-sha256",headers="(request-target) host date digest",signature="${signature}"`

    // 作成した署名をヘッダーに追加
    headers['Signature'] = signatureHeader

    // (request-target)はヘッダーに含めないので削除
    delete headers['(request-target)']

    return headers
}

function log(message: string) {
    message.includes('fail') ? logger.error(message) : logger.trace(message)
    return message
}