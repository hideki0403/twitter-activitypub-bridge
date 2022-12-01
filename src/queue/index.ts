import * as queues from './queues'
import processors from './processors'
import { IActor } from '@/services/activitypub/types'

queues.deliverQueue.process(processors.deliver)
queues.tweetPollingQueue.process(processors.pollingTweet)

// queues.tweetPollingQueue.add(null, {
//     repeat: {
//         cron: '*/5 * * * * *' // 5秒ごとに実行, 最高で1秒おきに実行できる (900req/15min = 1req/1sec)
//     },
//     backoff: 30 * 1000
// })

export function queueDeliver(remote: IActor, activity: any, actorId: string) {
    const inbox = remote.inbox || remote.sharedInbox
    if (!inbox) return

    queues.deliverQueue.add({
        to: inbox,
        activity,
        actorId
    })
}