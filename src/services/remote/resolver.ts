import * as Types from '@/services/activitypub/types'
import utils from '@/utils'

const logger = utils.logger.getLogger('remote')

export async function getRemoteUser(url: string) {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Accept': 'application/activity+json'
        }
    })

    if (!response.ok) {
        logger.error(`Failed to fetch remote user: ${url}`)
        return null
    }

    logger.info(`Fetched remote user: ${url}`)
    return await response.json() as Types.IActor
}