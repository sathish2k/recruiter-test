import { createAuthClient } from "better-auth/react";

// Points at the API, which hosts Better Auth under /api/auth/*.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;
