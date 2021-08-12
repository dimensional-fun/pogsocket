import { readFrame as _readFrame, unmask, WebSocketFrame } from "../deps.ts";

import type { PogSocket } from "../socket.ts";

export async function readFrame(socket: PogSocket): Promise<WebSocketFrame|null> {
    try {
        const frame = await _readFrame(socket.reader);
        unmask(frame.payload, frame.mask);
    
        return frame;
    } catch {
        return null;
    }
}
