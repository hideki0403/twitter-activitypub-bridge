import activityPub from '@/services/activitypub'
import config from '@/config'
import Router from '@koa/router'
const acctReg = /acct:[@~]?([^@]+)@?(.*)/

export async function webfinger(ctx: Router.RouterContext) {
    if (!ctx.query.resource || typeof ctx.query.resource !== 'string') {
        ctx.status = 400
        ctx.body = 'Bad Request'
        return
    }

    const acct = acctReg.exec(ctx.query.resource)
    const userId = acct?.[1]
    if (!userId) {
        ctx.status = 400
        ctx.body = 'Bad Request'
        return
    }

    if (acct?.[2] && acct[2] !== config.domain) {
        ctx.status = 400
        ctx.body = 'Bad Request'
        return
    }

    const user = await activityPub.wellKnown.webfinger(userId)
    if (!user) {
        ctx.status = 404
        ctx.body = 'Not Found'
        return
    }

    ctx.body = user
}

export async function hostMeta(ctx: Router.RouterContext) {
    ctx.type = 'application/xml'
    ctx.body = activityPub.wellKnown.hostMeta()
}

export async function hostMetaJson(ctx: Router.RouterContext) {
    ctx.body = activityPub.wellKnown.hostMetaJson()
}

export async function nodeinfo(ctx: Router.RouterContext) {
    ctx.body = activityPub.wellKnown.nodeinfo()
}

export async function nodeinfo2(ctx: Router.RouterContext) {
    ctx.body = await activityPub.wellKnown.nodeinfo2()
}

export async function manifestJson(ctx: Router.RouterContext) {
    ctx.body = activityPub.wellKnown.manifestJson()
}