import { assert, BufReader, readLong, readShort } from "../deps.ts";
import { unmask } from "../masking.ts";
import { WebSocketFrame } from "./base.ts";

export async function readFrame(
    reader: BufReader,
): Promise<WebSocketFrame> {
    let b = await reader.readByte();
    assert(b !== null);

    let isLastFrame = false;
    switch (b >>> 4) {
        case 0b1000:
            isLastFrame = true;
            break;
        case 0b0000:
            isLastFrame = false;
            break;
        default:
            throw new Error("invalid signature");
    }

    const opcode = b & 0x0f;

    // has_mask & payload
    b = await reader.readByte();
    assert(b !== null);
    
    const hasMask = b >>> 7;
    let payloadLength = b & 0b01111111;
    if (payloadLength === 126) {
        const l = await readShort(reader);
        assert(l !== null);
        payloadLength = l;
    } else if (payloadLength === 127) {
        const l = await readLong(reader);
        assert(l !== null);
        payloadLength = Number(l);
    }
    
    // mask
    let mask: Uint8Array | undefined;
    if (hasMask) {
        mask = new Uint8Array(4);
        assert((await reader.readFull(mask)) !== null);
    }

    // payload
    const payload = new Uint8Array(payloadLength);
    assert((await reader.readFull(payload)) !== null);

    return {
        isLastFrame,
        opcode,
        mask,
        payload,
    };
}

export async function readUnmaskedFrame(reader: BufReader): Promise<WebSocketFrame | null> {
    try {
        const frame = await readFrame(reader);
        unmask(frame.payload, frame.mask);
    
        return frame;
    } catch {
        return null;
    }
}

