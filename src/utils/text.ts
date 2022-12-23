import tweetParser from 'twitter-text'

export function entities2html(text: string) {
    const links = tweetParser.extractUrls(text)
    const hashtags = tweetParser.extractHashtags(text)
    const mentions = tweetParser.extractMentions(text)
    const tags = [] as { [key: string]: string }[]

    // URLをタグ化
    links.forEach(link => {
        text = text.replace(link, `<a href="${link}" rel="nofollow noopener noreferrer" target="_blank">${link}</a>`)
    })

    // ハッシュタグをタグ化
    hashtags.forEach(hashtag => {
        text = text.replace(`#${hashtag}`, `<a href="https://twitter.com/hashtag/${hashtag}">#${hashtag}</a>`)
        tags.push({
            type: 'Hashtag',
            href: `https://twitter.com/hashtag/${hashtag}`,
            name: `#${hashtag}`
        })
    })

    // メンションをタグ化
    mentions.forEach(mention => {
        text = text.replace(`@${mention}`, `<a href="https://twitter.com/${mention}">@${mention}</a>`)
        tags.push({
            type: 'Mention',
            href: `https://twitter.com/${mention}`,
            name: `@${mention}`
        })
    })

    return {
        text,
        tags
    }
}