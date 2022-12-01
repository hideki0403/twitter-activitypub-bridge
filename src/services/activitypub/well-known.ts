import twitter from '@/services/twitter'
import config from '@/config'
import database from '@/database'

export async function webfinger(userId: string) {
    const user = await twitter.getUser(userId)
    if (!user) return 

    return {
        subject: `acct:${userId}@${config.domain}`,
        links: [{
            rel: 'self',
            type: 'application/activity+json',
            href: `${config.url}/users/${user.id_str}`
        }]
    }
}

export function hostMeta() {
    return `<?xml version="1.0" encoding="UTF-8"?><XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0"><Link rel="lrdd" type="application/xrd+xml" template="${config.url}/.well-known/webfinger?resource={uri}"/></XRD>`
}

export function hostMetaJson() {
    return {
        links: [{
            rel: 'lrdd',
            type: 'application/jrd+json',
            template: `${config.url}/.well-known/webfinger?resource={uri}`
        }]
    }
}

export function nodeinfo() {
    return {
        links: [{
            rel: 'http://nodeinfo.diaspora.software/ns/schema/2.0',
            href: `${config.url}/nodeinfo/2.0`
        }]
    }
}

export async function nodeinfo2() {
    return {
        version: '2.0',
        software: {
            name: config.software_name,
            version: config.version
        },
        services: {
            inbound: [],
            outbound: []
        },
        usage: {
            localComments: 0,
            localPosts: await database.manager.db.collection('twitterTweet').countDocuments(),
            users: {
                total: await database.manager.db.collection('twitterUser').countDocuments(),
                activeHalfyear: 0,
                activeMonth: 0
            }
        },
        protocols: ['activitypub'],
        openRegistrations: false,
        metadata: {
            maintainer: {
                name: config.maintainer.name,
                email: config.maintainer.email
            },
            nodeName: config.name,
            nodeDescription: `Convert Twitter users and tweets to ActivityPub format. repo: ${config.repositoryUrl}`,
            repositoryUrl: config.repositoryUrl,
            themeColor: '#1da1f2'
        }
    }
}

export function manifestJson() {
    return {
        short_name: config.name,
        name: config.name,
        description: 'Convert twitter users and tweets to ActivityPub format.',
        start_url: '/',
        display: 'standalone',
        background_color: '#1da1f2',
        theme_color: '#1da1f2',
    }
}