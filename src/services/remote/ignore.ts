import config from '@/config'
import * as Types from '@/services/activitypub/types'
const hostRegex = /https?:\/\/([^/]+)\/?/

export function isIgnoreUser(actor: Types.IActor) {
    const host = (actor.id || actor.url)?.match(hostRegex)
    if (!host || !host[1]) return true

    return config.ignoreList.some((ignore) => {
        return new RegExp(ignore).test(`@${actor.preferredUsername}@${host[1]}`)
    })
}