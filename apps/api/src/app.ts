import { cors } from "@elysiajs/cors";
import { type AnyElysia, Elysia } from "elysia";
import { auth } from "./auth";
import { registerRoutes } from "./routes.loader";

export async function createApp(): Promise<AnyElysia> {
  const app = new Elysia()
    .use(
      cors({
        origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
        allowedHeaders: ["Content-Type", "Authorization"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
        credentials: true,
      }),
    )
    // Better Auth owns sign-in / sign-up / session at /api/auth/*.
    .all("/api/auth/*", ({ request }) => auth.handler(request))
    .get("/", () => ({ service: "recruit-api", status: "ok" }))
    .get("/health", () => ({ status: "ok" }));

  await registerRoutes(app);
  return app;
}
