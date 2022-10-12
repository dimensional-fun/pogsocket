import { BufWriter, concat, sliceLongToBytes } from "../deps.ts";
import { unmask } from "../masking.ts";
import { WebSocketFrame } from "./base.ts";

export async function writeFrame(
    frame: WebSocketFrame,
    writer: BufWriter,
) {
    const payloadLength = frame.payload.byteLength;
    let header: Uint8Array;
    
    const hasMask = frame.mask ? 0x80 : 0;
    if (frame.mask && frame.mask.byteLength !== 4) {
        throw new Error(
            "invalid mask. mask must be 4 bytes: length=" + frame.mask.byteLength,
        );
    }

    if (payloadLength < 126) {
        header = new Uint8Array([0x80 | frame.opcode, hasMask | payloadLength]);
    } else if (payloadLength < 0xffff) {
        header = new Uint8Array([
            0x80 | frame.opcode,
            hasMask | 0b01111110,
            payloadLength >>> 8,
            payloadLength & 0x00ff,
        ]);
    } else {
        header = new Uint8Array([
            0x80 | frame.opcode,
            hasMask | 0b01111111,
            ...sliceLongToBytes(payloadLength),
        ]);
    }

    if (frame.mask) {
        header = concat(header, frame.mask);
    }

    unmask(frame.payload, frame.mask);
    header = concat(header, frame.payload);

    await writer.write(header);
    await writer.flush();
}
