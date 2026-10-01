import { join } from "node:path";
import { Glob } from "bun";
import type { AnyElysia } from "elysia";

export async function registerRoutes<T extends AnyElysia>(app: T): Promise<T> {
  const routesDir = join(import.meta.dir, "routes");
  const glob = new Glob("**/*.routes.ts");

  const files: string[] = [];
  for await (const file of glob.scan({ cwd: routesDir, absolute: true })) {
    files.push(file);
  }
  files.sort();

  for (const file of files) {
    const mod = (await import(file)) as { default?: AnyElysia };
    if (mod.default) app.use(mod.default);
  }
  return app;
}
