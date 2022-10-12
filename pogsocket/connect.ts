import { BufReader, BufWriter } from "./deps.ts";
import { createMask, handshake } from "../websocket/mod.ts";
import { PogSocket, createPogSocket } from "./socket.ts";

export async function connectPogSocket(uri: string, options: PogSocketOptions = {}): Promise<PogSocket> {
    const url = new URL(uri);

    let conn: Deno.Conn;
    switch (url.protocol) {
        case "http:":
        case "ws:":
            conn = await Deno.connect({ hostname: url.hostname, port: +(url.port || 80) });
            break;
        case "https:":
        case "wss:":
            conn = await Deno.connectTls({ hostname: url.hostname, port: +(url.port || 443) })
            break;
        default:
            throw new TypeError(`Unsupported protocol: ${url.protocol}`);
    }

    const writer = options.writer ?? new BufWriter(conn)
        , reader = options.reader ?? new BufReader(conn);

    try {
        const headers = options.headers instanceof Headers
            ? options.headers
            : new Headers(options.headers);

        await handshake(url, headers, reader, writer);
    } catch (err) {
        conn.close();
        throw err;
    }

    return createPogSocket({ conn, reader, writer, mask: options.mask ?? createMask() });
}

export interface PogSocketOptions {
    headers?: HeadersInit;
    reader?: BufReader
    writer?: BufWriter;
    mask?: Uint8Array;
}
