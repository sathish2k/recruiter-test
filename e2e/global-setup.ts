import { execSync } from "node:child_process";
import path from "node:path";

// Wipe the database before the suite so every run starts empty and the tests
// build up all state themselves (register → create → verify).
export default function globalSetup() {
  const apiDir = path.join(__dirname, "..", "apps", "api");
  execSync("bun run scripts/clear.ts", { cwd: apiDir, stdio: "inherit" });
}
