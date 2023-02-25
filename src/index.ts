// entry-point
import database from '@/database'
import config from '@/config'
import utils from '@/utils'
import pico from 'picocolors'

const logger = utils.logger.getLogger('app')
logger.info(`Starting Twitter ActivityPub Bridge...`)
logger.info(`${config.software_name} v${config.version}`)

async function main() {
    if (!config.onlyVerifiedAccount) {
        logger.info(pico.bgRed(' Warning '))
        logger.info(pico.red('"onlyVerifiedAccounts" in config is disabled.'))
        logger.info(pico.red('This may interfere with admins in other instances, so it should basically be enabled.'))
        logger.info(pico.red('The contributors to this software are not responsible for any problems that may occur.'))
        await utils.wait(1000 * 10)
    }
    await database.manager.initialize()
    import('@/server').then(server => server.default())
}

main()