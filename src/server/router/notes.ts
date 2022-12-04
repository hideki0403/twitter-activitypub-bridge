import twitter from '@/services/twitter'
import activityPub from '@/services/activitypub'
import Router from '@koa/router'

export async function note(ctx: Router.RouterContext) {
    const noteId = ctx.params.id

    if (!noteId.match(/^[0-9]+$/)) {
        ctx.status = 400
        ctx.body = 'Bad Request'
        return
    }

    // acceptがtext/htmlなら元のツイートに転送
    if (ctx.accepts('text/html')) {
        return ctx.redirect(`https://twitter.com/redirect/status/${noteId}`)
    }

    const note = await twitter.getTweet(noteId)

    if (!note) {
        ctx.status = 404
        return
    }

    // 鍵垢だったら無視
    if (note.user.protected) {
        ctx.status = 404
        return
    }

    const response = await activityPub.notes.note(note)

    ctx.body = response
}