import { IActivity } from './types'

export function create(object: any) {
    return {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${object.id}/activity`,
        type: 'Create',
        actor: object.actor,
        object: object,
        to: object.to,
        cc: object.cc
    }
}

export function deletes(object: IActivity) {
    return {
        '@context': 'https://www.w3.org/ns/activitystreams',
        id: `${object.id}/activity`,
        type: 'Delete',
        actor: object.actor ?? object.id,
        object: object,
        published: new Date().toISOString()
    }
}