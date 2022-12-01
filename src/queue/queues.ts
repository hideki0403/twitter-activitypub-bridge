import Bull from 'bull'
import config from '@/config'
import * as Types from './types'

function createQueue<T>(name: string, options?: Bull.QueueOptions) {
    return new Bull<T>(name, Object.assign({
        redis: {
            port: config.redis.port,
            host: config.redis.host,
            password: config.redis.password,
            db: config.redis.db || 0
        },
        prefix: 'bridge:queue',
        settings: {
            backoffStrategies: {
                'exponential': (attemptsMade, err) => {
                    const maxBackoff = 1000 * 60 * 60 * 6
                    const backoff = 60 * 1000 * Math.pow(2, attemptsMade)
                    return Math.min(backoff, maxBackoff)
                }
            }
        }
    } as Bull.QueueOptions, options))
}

export const deliverQueue = createQueue<Types.deliverQueue>('deliver')
export const tweetPollingQueue = createQueue<null>('pollingTweet')

export const bullboard = [deliverQueue, tweetPollingQueue]