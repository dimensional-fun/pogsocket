import { WebSocketMessage } from "../deps.ts";

/**
 * Whether a websocket message is binary.
 * @param message The websocket isBinaryMessage
 * @returns true, if the provided message is binary
 */
export function isBinaryMessage(message: WebSocketMessage): message is Uint8Array {
    return typeof message !== "string";
}
