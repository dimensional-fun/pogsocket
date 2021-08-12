import { OpCode, WebSocketMessage } from "../deps.ts";
import { encoder } from "../encoding.ts";
import { enqueueFrame, PogSocket } from "../socket.ts";
import { isBinaryMessage } from "./is_binary.ts";

const encode = encoder()

export function sendFrame(socket: PogSocket, opCode: OpCode, payload: WebSocketMessage) {
    return enqueueFrame(socket, {
        mask: socket.mask,
        isLastFrame: true,
        opcode: opCode,
        payload: isBinaryMessage(payload) ? payload : encode(payload)
    });
}
