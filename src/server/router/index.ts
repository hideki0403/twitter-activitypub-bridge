import Router from '@koa/router'
import * as wellKnown from './well-known'
import * as users from './users'
import * as inbox from './inbox'
import * as notes from './notes'
import * as assets from './assets'

type Routes = {
    [key: string]: (ctx: Router.RouterContext) => void
}

export const get = {
    '/': assets.index,
    '/robots.txt': assets.robots,
    '/favicon.ico': assets.favicon,
    '/.well-known/webfinger': wellKnown.webfinger,
    '/.well-known/host-meta': wellKnown.hostMeta,
    '/.well-known/host-meta.json': wellKnown.hostMetaJson,
    '/.well-known/nodeinfo': wellKnown.nodeinfo,
    '/nodeinfo/2.0': wellKnown.nodeinfo2,
    '/manifest.json': wellKnown.manifestJson,
    '/users/:id': users.user,
    '/notes/:id': notes.note,
} as Routes

export const post = {
    '/inbox': inbox.inbox,
    '/users/:id/inbox': inbox.inbox,
} as Routes