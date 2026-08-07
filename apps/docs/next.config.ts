import { join } from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Dev and build must not share an output directory: `next build` overwrites
  // the chunks a running `next dev` is serving, which surfaces as
  // ChunkLoadError in the browser until the dev server is restarted.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // The monorepo root, stated rather than inferred: packages/ live outside this
  // app (see externalDir), and Next otherwise guesses the root from lockfiles.
  turbopack: { root: join(import.meta.dirname, "..", "..") },
  experimental: {
    // Next 16.2.12 aborts the build outright when it can't load the TS
    // compiler API; TypeScript 7 (the native port) ships only `lib/tsc.js`.
    // This tells Next to shell out to the TypeScript CLI instead of requiring
    // the API. Types stay gated by `tsc --noEmit`, not by the build.
    useTypeScriptCli: true,
    externalDir: true,
  },
  // Next's in-build type check requires `typescript/lib/typescript.js`, which
  // TypeScript 7 (the native port) doesn't ship — it only has `lib/tsc.js`. So
  // Next decides TypeScript is missing and tries to install it, which fails the
  // build. Types are still gated, more thoroughly, by `tsc --noEmit`:
  // `bunx turbo run typecheck` for the apps and `bunx tsc --noEmit` at the repo
  // root for packages/.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
