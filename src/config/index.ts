import * as fs from 'fs'
import * as yaml from 'js-yaml'
import rootPath from 'app-root-path'
import deepmerge from 'deepmerge'
import * as Types from './types'

const config = yaml.load(fs.readFileSync(rootPath.resolve('config.yml'), 'utf8')) as Types.Config
const packageJson = require(rootPath.resolve('package.json')) as Types.packageJson

const fallBackConfig: Types.Config = {
    name: 'Twitter ActivityPub Bridge',
    domain: 'localhost',
    port: 3000,
    useQueueDashboard: false,
    db: {
        host: 'localhost',
        port: 27017,
        name: 'twitter-activitypub-bridge'
    },
    redis: {
        host: 'localhost',
        port: 6379,
        password: '',
        db: 0
    },
    twitter: {
        consumer_key: '',
        consumer_secret: '',
        access_token: '',
        access_token_secret: '',
        list_prefix: 'bridge-'
    },
    maintainer: {
        name: 'unknown',
        email: 'unknown@localhost'
    },
    ignoreList: []
}
const mergedConfig = deepmerge(fallBackConfig, config)

const generatedConfig = {
    software_name: packageJson.name,
    version: packageJson.version,
    url: `https://${mergedConfig.domain}`,
    repositoryUrl: packageJson.repository.url,
}

export default deepmerge(mergedConfig, generatedConfig)