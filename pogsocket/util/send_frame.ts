import { encoder } from "../../encoding.ts";
import { OpCode, WebSocketMessage, isBinaryMessage } from "../../websocket/mod.ts";
import { PogSocket, enqueueFrame } from "../socket.ts";

const encode = encoder()

export function sendFrame(
    socket: PogSocket,
    opCode: OpCode,
    payload: WebSocketMessage
) {
    return enqueueFrame(socket, {
        mask: socket.mask,
        isLastFrame: true,
        opcode: opCode,
        payload: isBinaryMessage(payload) ? payload : encode(payload)
    });
}
