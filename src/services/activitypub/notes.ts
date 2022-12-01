import { TweetV1 } from 'twitter-api-v2'
import * as Types from '@/database/types'
import utils from '@/utils'
import twitter from '@/services/twitter'
import config from '@/config'

export async function note(note: TweetV1) {
    // もし対象のツイートがリツイート or 中身が空だったら無視
    if (note.retweeted_status || !note.full_text) return null

    // 引用を含んでいた場合はquote用処理を行う
    const isQuote = note.is_quote_status
    const cleanNote = processNote(note)

    const user = note.user

    // レスポンス生成
    const response = {
        '@context': [
            'https://www.w3.org/ns/activitystreams',
            {
                quoteUrl: 'as:quoteUrl',
                misskey: 'https://misskey-hub.net/ns#',
                _misskey_content: 'misskey:_misskey_content',
                _misskey_quote: 'misskey:_misskey_quote'
            }
        ],
        id: `${config.url}/notes/${note.id_str}`,
        type: 'Note',
        actor: `${config.url}/users/${user.id_str}`,
        attributedTo: `${config.url}/users/${user.id_str}`,
        content: !isQuote ? cleanNote.content : cleanNote.contentWithQuote,
        attachment: [],
        published: new Date(note.created_at).toISOString(),
        to: [`${config.url}/users/${user.id_str}/followers`], // toがfollowersだとlocalのみになる, activitystreams#Publicだとpublicになる
        cc: ['https://www.w3.org/ns/activitystreams#Public'], // localにしたいのでこっちにactivitystreams#Publicを持ってくる,
        inReplyTo: note.in_reply_to_status_id_str ? `${config.url}/notes/${note.in_reply_to_status_id_str}` : null,
        sensitive: !!note.possibly_sensitive,
    } as any

    // 引用リツイート
    if (isQuote) {
        response._misskey_content = cleanNote.content
        response._misskey_quote = cleanNote.quoteUrl
        response.quoteUrl = cleanNote.quoteUrl
    }

    // メディアを追加
    if (note.extended_entities?.media) {
        for (const media of note.extended_entities.media) {
            // 動画
            if (media.type === 'video') {
                // bitrateが一番高いvideoを追加
                const video = media.video_info?.variants?.sort((a, b) => {
                    const a_bit = a.bitrate || 0
                    const b_bit = b.bitrate || 0
                    return b_bit - a_bit
                })[0]
                
                if (!video) continue

                response.attachment.push(utils.jsonld.createDocument(video.url, video.content_type))
                continue
            }

            // 画像など
            response.attachment.push(utils.jsonld.createImage(media.media_url_https))
        }
    }

    return response
}

function processNote(note: TweetV1) {
    const content = twitter.removeMediaLinks(twitter.replaceRawLinks(note.full_text, note.entities), note.entities).replace(/\n/g, '<br>').replace(/https?:\/\/twitter.com\/.*\/status\/[0-9]+/g, '').trim()
    const quoteUrl = `${config.url}/notes/${note.quoted_status_id_str}`
    const contentWithQuote = `${content}<br>RE: ${quoteUrl}`

    return {
        content,
        quoteUrl,
        contentWithQuote
    }
}

export async function renote(note: TweetV1) {
    // もし対象のツイートがリツイートでなければ無視
    if (!note.retweeted_status) return null

    // レスポンス生成
    const response = {
        '@context': [
            'https://www.w3.org/ns/activitystreams',
            {
                quoteUrl: 'as:quoteUrl',
                misskey: 'https://misskey-hub.net/ns#',
                _misskey_content: 'misskey:_misskey_content',
                _misskey_quote: 'misskey:_misskey_quote'
            }
        ],
        id: `${config.url}/notes/${note.id_str}`,
        type: 'Announce',
        actor: `${config.url}/users/${note.user.id_str}`,
        published: new Date(note.created_at).toISOString(),
        object: `${config.url}/notes/${note.retweeted_status.id_str}`,
        to: [`${config.url}/users/${note.user.id_str}/followers`],
        cc: ['https://www.w3.org/ns/activitystreams#Public'],
    } as any

    return response
}