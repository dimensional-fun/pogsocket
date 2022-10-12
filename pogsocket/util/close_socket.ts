import { encoder } from "../../encoding.ts";
import { OpCode } from "../../websocket/mod.ts";
import { PogSocket } from "../socket.ts";
import { sendFrame } from "./send_frame.ts";

const encode = encoder()

/**
 * Closes the provided pogsocket with a code and/or reason.
 * @param socket pogsocket to clsoe
 * @param code The close code
 * @param reason The close reason.
 */
export async function closeSocket(socket: PogSocket, code = 1000, reason?: string) {
    try { 
        const header = [ code >>> 8, code & 0x00ff ];

        let payload: Uint8Array;
        if (reason) {
            const bytes = encode(reason);
            payload = new Uint8Array(2 + bytes.byteLength);
            payload.set(header);
            payload.set(bytes, 2);
        } else {
            payload = new Uint8Array(header);
        }

        await sendFrame(socket, OpCode.Close, payload);
    } catch (e) {
        throw e;
    } finally {
        closeSocketConnection(socket);
    }
}

/**
 * Closes the connection of the supplied pogsocket, only for internal use.
 * @param socket The pogsocket to close.
 */
 export function closeSocketConnection(socket: PogSocket): void {
    if (socket.isClosed) {
        return;
    }

    try { 
        socket.conn.close();
    } catch (e) {
        throw e;
    } finally {
        socket.isClosed = true;
        while (socket.frameQueue.length > 0) {
            const entry = socket.frameQueue.shift();
            if (!entry) {
                break;
            }

            const error = new Deno.errors.ConnectionReset("Socket has been closed.");
            entry.deferred.reject(error);
        }
    }
}
