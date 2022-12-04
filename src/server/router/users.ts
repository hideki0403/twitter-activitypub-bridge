import twitter from '@/services/twitter'
import activityPub from '@/services/activitypub'
import Router from '@koa/router'

export async function user(ctx: Router.RouterContext) {
    const uid = ctx.params.id

    if (!uid.match(/^[0-9]+$/)) {
        ctx.status = 400
        ctx.body = 'Bad Request'
        return
    }

    const user = await twitter.getUser(uid, 'uid', true)
    if (!user) {
        ctx.status = 404
        return
    }

    // acceptがtext/htmlならTwitterに転送
    if (ctx.accepts('text/html')) {
        return ctx.redirect(`https://twitter.com/${user.screen_name}`)
    }

    const response = await activityPub.users.user(user)
    if (!response) {
        ctx.status = 404
        return
    }

    ctx.body = response
}