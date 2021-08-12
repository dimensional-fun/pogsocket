export function createMask(length = 4): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
}