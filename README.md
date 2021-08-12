# PogSocket

> Deno websocket client (based on the original deno websocket client).

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

---

[melike2d](https://dimensional.fun)