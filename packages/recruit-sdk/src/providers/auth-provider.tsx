"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { createAuthClient } from "better-auth/react";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { setAuthToken } from "../client";

/** Better Auth client. Uses the current (web) origin so the session cookie is
 * same-origin; the web app proxies /api/auth/* to the API (see next.config). */
export const authClient = createAuthClient({
  basePath: "/api/auth",
});

export const { signIn, signUp, signOut, useSession } = authClient;

export interface AuthUser {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string;
  agencyId?: string;
}

const AuthUserContext = createContext<AuthUser | null>(null);

/** The logged-in user from the session (null when unauthenticated). */
export function useAuthUser(): AuthUser | null {
  return useContext(AuthUserContext);
}

/** Signs the user out and redirects to NEXT_PUBLIC_LOGOUT_CALLBACK_URL (default
 * "/login"). Clears the in-memory auth token; the full reload drops the SWR cache. */
export function useLogout(): () => void {
  return useCallback(() => {
    setAuthToken(undefined);
    const callbackUrl = process.env.NEXT_PUBLIC_LOGOUT_CALLBACK_URL || "/login";
    void authClient.signOut().finally(() => {
      window.location.href = callbackUrl;
    });
  }, []);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isPending } = authClient.useSession();
  const token = data?.session?.token;
  const user = (data?.user as AuthUser | undefined) ?? null;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isPending) return;
    setAuthToken(token);
    setReady(true);
  }, [isPending, token]);

  if (!ready) {
    return (
      <Box
        sx={{
          display: "flex",
          minHeight: "100dvh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}
