export type WebSocketMessage = string | Uint8Array;

/** 
 * Represents a websocket op code 
 */
export enum OpCode {
    Continue = 0x0,
    TextFrame = 0x1,
    BinaryFrame = 0x2,
    Close = 0x8,
    Ping = 0x9,
    Pong = 0xa,
}


/** 
 * Represents a websocket frame. 
 */
export interface WebSocketFrame {
    isLastFrame: boolean;
    opcode: OpCode;
    mask?: Uint8Array;
    payload: Uint8Array;
}

/**
 * Whether a websocket message is binary.
 * @param message The websocket isBinaryMessage
 * @returns true, if the provided message is binary
 */
export function isBinaryMessage(message: WebSocketMessage): message is Uint8Array {
    return typeof message !== "string";
}

