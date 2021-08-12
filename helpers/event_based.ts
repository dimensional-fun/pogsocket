import { readSocket } from "./read_socket.ts";

import type { WebSocketMessage } from "../deps.ts";
import type { PogSocket } from "../socket.ts";

export interface EventHandlers {
    message?: (data: WebSocketMessage) => void;
    close?: (code: number, reason?: string) => void;
    ping?: (data: Uint8Array) => void;
    pong?: (data: Uint8Array) => void;
}

export async function useEvents(socket: PogSocket, handlers: EventHandlers) {
    for await (const event of readSocket(socket)) {
        switch (event.type) {
            case "message":
                handlers.message?.(event.data);
                break;
            case "close":
                handlers.close?.(event.code, event.reason);
                break;
            case "ping":
                handlers.ping?.(event.data);
                break;
            case "pong":
                handlers.pong?.(event.data);
                break;
        }
    }
}