import config from '@/config'
import { TwitterApi } from 'twitter-api-v2'

const client = new TwitterApi({
    appKey: config.twitter.consumer_key,
    appSecret: config.twitter.consumer_secret,
    accessToken: config.twitter.access_token,
    accessSecret: config.twitter.access_token_secret,
})

export default client