import http from "http";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase } from "./db.js";
import { createRealtimeServer } from "./realtime.js";

await connectDatabase();

const app = createApp();
const server = http.createServer(app);
createRealtimeServer(server);

server.listen(env.port, () => {
  console.log(`IntellMeet API listening on http://localhost:${env.port}`);
});
