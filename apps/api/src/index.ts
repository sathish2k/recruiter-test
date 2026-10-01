import { createApp } from "./app";

const port = Number(process.env.PORT ?? 3001);

const app = await createApp();
app.listen(port);

console.log(`🦊 @recruit/api running at http://localhost:${port}`);

export type App = typeof app;
