import { sendFrame } from "./send_frame.ts";

import type { PogSocket } from "../socket.ts";
import { OpCode, WebSocketMessage, isBinaryMessage } from "../../websocket/mod.ts";

/**
 * Sends a message to the server.
 * @param socket The pogsocket to use.
 * @param message The message to send.
 * @returns A deferred value
 */
export function sendMessage(socket: PogSocket, message: WebSocketMessage) {
    const opCode = isBinaryMessage(message) 
        ? OpCode.BinaryFrame 
        : OpCode.TextFrame

    return sendFrame(socket, opCode, message);
}