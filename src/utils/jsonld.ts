export function createAttachment(name: string, value: string) {
    return {
        type: 'PropertyValue',
        name,
        value
    }
}

export function createImage(url: string) {
    return {
        type: 'Image',
        url,
        name: null
    }
}

export function createDocument(url: string, mime?: string) {
    const obj = {
        type: 'Document',
        url,
        name: null
    } as any
    if (mime) obj['mediaType'] = mime
    return obj
}