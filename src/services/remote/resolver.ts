import * as Types from '@/services/activitypub/types'
import utils from '@/utils'

const logger = utils.logger.getLogger('remote')

export async function getRemoteUser(url: string) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/activity+json'
        }
    }).catch(e => {
        logger.error(e)
        return null
    })

    if (!response || !response.ok) {
        logger.error(`Failed to fetch remote user: ${url}`)
        return null
    }

    const user = await response.json().catch(e => {
        logger.error(`Failed to fetch remote user (invalid JSON): ${url}`)
        return null
    })

    if (!user) return null

    logger.info(`Fetched remote user: ${url}`)
    return user as Types.IActor
}