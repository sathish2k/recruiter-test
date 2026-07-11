import { Elysia, type AnyElysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { registerRoutes } from "./routes.loader";

export async function createApp(): Promise<AnyElysia> {
  const app = new Elysia()
    .use(
      cors({
        origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
      }),
    )
    .get("/", () => ({ service: "recruit-api", status: "ok" }))
    .get("/health", () => ({ status: "ok" }));

  await registerRoutes(app);
  return app;
}
