// entry-point
import database from '@/database'
import config from '@/config'
import utils from '@/utils'

const logger = utils.logger.getLogger('app')
logger.info(`Starting Twitter ActivityPub Bridge...`)
logger.info(`${config.software_name} v${config.version}`)

async function main() {
    await database.manager.initialize()
    import('@/server').then(server => server.default())
}

main()