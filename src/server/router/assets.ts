import Router from '@koa/router'

export function favicon(ctx: Router.RouterContext) {
    ctx.status = 404
}