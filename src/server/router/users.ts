import twitter from '@/services/twitter'
import activityPub from '@/services/activitypub'
import Router from '@koa/router'

export async function user(ctx: Router.RouterContext) {
    const uid = ctx.params.id
    const user = await twitter.getUser(uid, 'uid')
    if (!user) {
        ctx.status = 404
        return
    }

    const response = await activityPub.users.user(user)
    if (!response) {
        ctx.status = 404
        return
    }

    ctx.body = response
}