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