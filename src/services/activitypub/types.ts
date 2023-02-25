export interface IObject {
    '@context': string | string[]
    type: string | string[]
    id?: string
    summary?: string
    published?: string
    attachment?: any[]
    content?: string
    name?: string
    icon?: any
    image?: any
    object?: IObject | string
    url?: string
}

export interface IActivity extends IObject {
    actor: IObject | string
    object: IObject | string
    target?: IObject | string
}

export interface IActor extends IObject {
    type: string
    name?: string
    preferredUsername?: string
    inbox: string
    outbox: string
    sharedInbox?: string
    endpoints?: {
        sharedInbox?: string
    }
    publicKey?: {
        id: string
        publicKeyPem: string
    }
    followers?: string
    following?: string
}