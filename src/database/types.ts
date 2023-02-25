import * as Twitter from 'twitter-api-v2'
import * as ActivityPub from '@/services/activitypub/types'

export type allowedTableName = 'followingList' | 'remoteUser' | 'twitterTweet' | 'twitterUser' | 'deletedTwitterUser' | 'twitterUserKeypair' | 'userListLink' | 'listStates' | 'store' | 'twitterIdTable'

export interface ITwitterUser {
    screen_name: string | null
    uid: string | null
    updatedAt: number
    user: ITwitterUserProfile
}

export interface IDeletedTwitterUser {
    uid: string,
    updatedAt: number
}

export interface ITwitterUserProfile extends Twitter.UserV1 {
    status?: Twitter.TweetV1
    following: boolean
}

export interface ITwitterTweet {
    id: string,
    authorUid: string,
    updatedAt: number,
    tweet: Twitter.TweetV1 | null
}
export interface ITwitterUserKeypair {
    uid: string
    publicKey: string
    privateKey: string
}

export interface ITwitterIDTable {
    uid: string
    screen_name: string
    updatedAt: number
}

export interface IRemoteUser {
    id: string
    user: ActivityPub.IActor
    updatedAt: number
}

export interface IFollowingList {
    source: string
    target: string
    updatedAt: number
}

export interface IUserListLink {
    target: string
    list: string
    updatedAt: number
}

export interface IListStates {
    id: string
    lastTweetId: string
    updatedAt: number
}

export interface IStore {
    key: string
    value: any
    updatedAt: number
}