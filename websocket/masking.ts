/** 
 * Unmask masked websocket payload 
 */
export function unmask(payload: Uint8Array, mask?: Uint8Array): void {
    if (!mask?.length) {
        return;
    }

    for (let i = 0, len = payload.length; i < len; i++) {
        payload[i] ^= mask[i & 3];
    }
}

/**
 * Creates a mask of n-byte length.
 * 
 * @param length The length of the mask, in bytes.
 */
export function createMask(length = 4): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
}
