import { OpCode } from "../deps.ts";
import { decoder } from "../encoding.ts";
import { closeSocket, closeSocketConnection } from "./close_socket.ts";
import { readFrame } from "./read_frame.ts";
import { sendFrame } from "./send_frame.ts";

import type { PogSocket } from "../socket.ts";
import type { WebSocketFrame } from "../deps.ts";

function getLength(frames: WebSocketFrame[]): number {
    return frames.reduce((length, frame) => length + frame.payload.length, 0);
}

function getCloseEvent(frame: WebSocketFrame, decode = decoder()): CloseEvent {
    return { 
        // [0x12, 0x34] -> 0x1234
        code: (frame.payload[0] << 8) | frame.payload[1], 
        reason: decode(frame.payload.subarray(2, frame.payload.length)), 
        type: "close"
    }
}

export async function* readSocket(socket: PogSocket): AsyncIterableIterator<PogSocketEvent> {
    const decode = decoder();

    /* handle frames. */
    let frames: WebSocketFrame[] = [];
    while (!socket.isClosed) {
        const frame = await readFrame(socket);
        if (!frame) {
            closeSocketConnection(socket);
            break;
        }

        switch (frame.opcode) {
            case OpCode.TextFrame:
            case OpCode.BinaryFrame:
            case OpCode.Continue:
                frames.push(frame);

                /* merge all of the received frames. */
                if (frame.isLastFrame) {
                    const message = new Uint8Array(getLength(frames));
                    let pos = 0;
                    for (const frame of frames) {
                        message.set(frame.payload, pos);
                        pos += frame.payload.length;
                    }

                    yield {
                        data: frames[0].opcode === OpCode.TextFrame
                            ? decode(message)
                            : message,
                        type: "message"
                    }

                    frames = [];
                }

                break;
            case OpCode.Close: {
                const event = getCloseEvent(frame, decode);
                await closeSocket(socket, event.code, event.reason);
                yield event;
                break;
            }
            case OpCode.Ping:
                await sendFrame(socket, OpCode.Pong, frame.payload);
                yield { type: "ping", data: frame.payload }
                break;
            case OpCode.Pong:
                yield { type: "pong", data: frame.payload }
                break;
        }
    }
}

export type PogSocketEvent = MessageEvent | PingEvent | PongEvent | CloseEvent;
export type PogSocketEventType = "message" | "ping" | "pong" | "close";

interface IPogSocketEvent {
    type: PogSocketEventType;
}

export interface MessageEvent extends IPogSocketEvent {
    type: "message";
    data: string | Uint8Array;
}

export interface PingEvent extends IPogSocketEvent {
    type: "ping";
    data: Uint8Array;
}

export interface PongEvent extends IPogSocketEvent {
    type: "pong";
    data: Uint8Array;
}

export interface CloseEvent extends IPogSocketEvent {
    type: "close";
    code: number;
    reason?: string;
}

