import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
