import config from '@/config'
import Router from '@koa/router'

export function index(ctx: Router.RouterContext) {
    return ctx.redirect(config.repositoryUrl)
}

export function favicon(ctx: Router.RouterContext) {
    ctx.status = 404
}

export function robots(ctx: Router.RouterContext) {
    ctx.type = 'text/plain'
    ctx.body = 'User-agent: *' + '\n' + 'Disallow: /'
}