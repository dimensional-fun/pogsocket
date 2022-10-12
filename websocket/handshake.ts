import { TextProtoReader, assert, base64, BufReader, BufWriter } from "./deps.ts";
import { encoder } from "../encoding.ts";

const encode = encoder();

const kGUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const kSecChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-.~_";

export async function handshake(
    url: URL,
    headers: Headers,
    bufReader: BufReader,
    bufWriter: BufWriter,
) {
    const { hostname, pathname, search } = url;
    const key = createSecKey();

    if (!headers.has("host")) {
        headers.set("host", hostname);
    }
    headers.set("upgrade", "websocket");
    headers.set("connection", "upgrade");
    headers.set("sec-websocket-key", key);
    headers.set("sec-websocket-version", "13");

    let headerStr = `GET ${pathname}${search} HTTP/1.1\r\n`;
    for (const [key, value] of headers) {
        headerStr += `${key}: ${value}\r\n`;
    }
    headerStr += "\r\n";

    await bufWriter.write(new TextEncoder().encode(headerStr));
    await bufWriter.flush();

    // TODO: remove use of deprecated class.
    const tpReader = new TextProtoReader(bufReader);

    const statusLine = await tpReader.readLine();
    if (statusLine === null) {
        throw new Deno.errors.UnexpectedEof();
    }

    const m = statusLine.match(/^(?<version>\S+) (?<statusCode>\S+) /);
    if (!m) {
        throw new Error("ws: invalid status line: " + statusLine);
    }

    assert(m.groups);
    const { version, statusCode } = m.groups;
    if (version !== "HTTP/1.1" || statusCode !== "101") {
        throw new Error(
            `ws: server didn't accept handshake: ` +
            `version=${version}, statusCode=${statusCode}`,
        );
    }

    const responseHeaders = await tpReader.readMimeHeader();
    if (responseHeaders === null) {
        throw new Deno.errors.UnexpectedEof();
    }

    const expectedSecAccept = await createSecAccept(key);
    const secAccept = responseHeaders.get("sec-websocket-accept");
    if (secAccept !== expectedSecAccept) {
        throw new Error(
            `ws: unexpected sec-websocket-accept header: ` +
            `expected=${expectedSecAccept}, actual=${secAccept}`,
        );
    }
}


/** Returns true if input headers are usable for WebSocket, otherwise false.  */
export function acceptable(req: { headers: Headers }): boolean {
    const upgrade = req.headers.get("upgrade");
    if (!upgrade || upgrade.toLowerCase() !== "websocket") {
        return false;
    }

    const secKey = req.headers.get("sec-websocket-key");
    return (
        req.headers.has("sec-websocket-key") &&
        typeof secKey === "string" &&
        secKey.length > 0
    );
}

/** Create value of Sec-WebSocket-Accept header from inputted nonce. */
export async function createSecAccept(nonce: string): Promise<string> {
    const result = await crypto.subtle.digest(
        "SHA-1",
        encode(nonce + kGUID)
    );

    return base64.encode(result);
}


/** Returns base64 encoded 16 bytes string for Sec-WebSocket-Key header. */
export function createSecKey(): string {
    let key = "";
    for (let i = 0; i < 16; i++) {
        const j = Math.floor(Math.random() * kSecChars.length);
        key += kSecChars[j];
    }

    return btoa(key);
}
