import Router from '@koa/router'
import activityPub from '@/services/activitypub'
import httpSignature from '@peertube/http-signature'
import * as Types from '@/services/activitypub/types' 

export async function inbox(ctx: Router.RouterContext) {
    const validType = ctx.accepts('application/activity+json', 'application/ld+json')

    if (!validType) {
        ctx.status = 406
        return
    }

    let signature

    try {
        signature = httpSignature.parseRequest(ctx.req)
    } catch (e) {
        ctx.status = 401
        return
    }

    activityPub.inbox.inbox(signature, ctx.request.body as Types.IActivity)

    ctx.status = 202
}