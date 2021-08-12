export type Encoder = (input?: string) => Uint8Array;

export function encoder(): Encoder {
    const _encoder = new TextEncoder();
    return input => _encoder.encode(input);
}

export type Decoder = (input?: Uint8Array) => string;

export function decoder(): Decoder {
    const _decoder = new TextDecoder();
    return input => _decoder.decode(input);
}

