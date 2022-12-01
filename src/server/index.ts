import Koa from 'koa'
import Router from '@koa/router'
import config from '@/config'
import bodyParser from 'koa-bodyparser'
import * as Routes from './router'
import { createBullBoard } from '@bull-board/api'
import { BullAdapter } from '@bull-board/api/bullAdapter.js'
import { KoaAdapter } from '@bull-board/koa'
import { bullboard as queues } from '@/queue/queues'
import koaLogger from 'koa-logger'
import utils from '@/utils'

const logger = utils.logger.getLogger('server')
const router = new Router()
const app = new Koa()

export default function() {
    app.use(koaLogger(log => {
        logger.trace(log)
    }))

    // create routing
    Object.keys(Routes.get).forEach((path) => {
        router.get(path, Routes.get[path])
    })

    Object.keys(Routes.post).forEach((path) => {
        router.post(path, Routes.post[path])
    })

    app.use(bodyParser({
        extendTypes: {
            json: ['application/activity+json', 'application/ld+json']
        }
    }))

    app.use(router.routes())
    app.use(router.allowedMethods())
    // end

    // bull-board
    if (config.useQueueDashboard) {
        const serverAdapter = new KoaAdapter()
        createBullBoard({
            queues: queues.map(q => new BullAdapter(q)),
            serverAdapter,
        })

        serverAdapter.setBasePath('/queue')
        app.use(serverAdapter.registerPlugin())
        logger.info(`Queue dashboard enabled: http://localhost:${config.port}/queue`)
    }
    // end

    app.listen(config.port, () => {
        logger.info(`Server listening on port ${config.port}`)
    })
}