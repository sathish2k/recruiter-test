import { join } from "node:path";
import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Dev and build must not share an output directory: `next build` overwrites
  // the chunks a running `next dev` is serving, which surfaces as
  // ChunkLoadError in the browser until the dev server is restarted.
  distDir: process.env.NODE_ENV === "development" ? ".next-dev" : ".next",
  // The monorepo root, stated rather than inferred: packages/ live outside this
  // app (see externalDir), and Next otherwise guesses the root from lockfiles.
  turbopack: { root: join(import.meta.dirname, "..", "..") },
  reactStrictMode: true,
  // Next's in-build type check requires `typescript/lib/typescript.js`, which
  // TypeScript 7 (the native port) doesn't ship — it only has `lib/tsc.js`. So
  // Next decides TypeScript is missing and tries to install it, which fails the
  // build. Types are still gated, more thoroughly, by `tsc --noEmit`:
  // `bunx turbo run typecheck` for the apps and `bunx tsc --noEmit` at the repo
  // root for packages/.
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    externalDir: true,
  },
  // Proxy Better Auth through the web origin so its session cookie is
  // same-origin — required for the server-side auth guard on guarded pages.
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${API_URL}/api/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
