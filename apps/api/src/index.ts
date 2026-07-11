import { createApp } from "./app";
import { connectDb } from "./db";

const port = Number(process.env.PORT) || 3001;

await connectDb();

const app = (await createApp()).listen(port);

console.log(
  `recruit-api listening on http://localhost:${app.server?.port ?? port} (db connected)`,
);

export type App = typeof app;
