import { BufReader, BufWriter, Deferred, deferred } from "./deps.ts";
import { WebSocketFrame, writeFrame } from "../websocket/mod.ts";

export function createPogSocket({ conn, reader, writer, mask }: PogSocketInit): PogSocket {
    return {
        conn,
        frameQueue: [],
        isClosed: false,
        reader: reader ?? new BufReader(conn),
        writer: writer ?? new BufWriter(conn),
        mask
    };
}

export function dequeueFrame(socket: PogSocket) {
    const [entry] = socket.frameQueue;
    if (!entry || socket.isClosed) {
        return;
    }

    const { deferred, frame } = entry;
    writeFrame(frame, socket.writer)
        .then(deferred.resolve)
        .catch(deferred.reject)
        .finally(() => {
            socket.frameQueue.shift();
            dequeueFrame(socket);
        });
}

export function enqueueFrame(socket: PogSocket, frame: WebSocketFrame): Deferred<void> {
    if (socket.isClosed) {
        throw new Deno.errors.ConnectionReset("Socket has already been closed.");
    }

    const d = deferred<void>();

    socket.frameQueue.push({ deferred: d, frame });
    if (socket.frameQueue.length === 1) {
        dequeueFrame(socket);
    }

    return d;
}

export interface PogSocket {
    readonly conn: Deno.Conn;
    readonly reader: BufReader;
    readonly writer: BufWriter;
    readonly mask?: Uint8Array;

    frameQueue: QueuedFrame[];
    isClosed: boolean;
}

export interface QueuedFrame {
    frame: WebSocketFrame;
    deferred: Deferred<void>;
}

export interface PogSocketInit {
    conn: Deno.Conn;
    reader?: BufReader;
    writer?: BufWriter;
    mask?: Uint8Array;
}
