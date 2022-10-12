# PogSocket

> A functional deno websocket client!

## Usage

**Connecting to Echo Server**

```ts
import { connectPogSocket, readSocket, sendMessage } from "https://deno.land/x/pogsocket/mod.ts";

const socket = await connectPogSocket("ws://localhost:3030");
setInterval(() => sendMessage(socket, "hello me!"), 2000);

for await (const event of readSocket(socket)) {
    if (event.type === "message") {
        console.log(event.message);
    }
}
```

## Acknowledgements

- [_/websocket_](/websocket) (and parts of [_/pogsocket_](/pogsocket)) were originally written by the **Deno Authors**, this couldn't have been done without them :)


---

[melike2d](https://dimensional.fun)