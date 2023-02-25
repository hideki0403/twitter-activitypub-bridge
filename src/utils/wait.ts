export default async function wait(ms: number) {
    return await new Promise(resolve => setTimeout(resolve, ms))
}