"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { signOut, useSession } from "next-auth/react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { setAuthToken } from "../client";

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
 * "/login"). Clears the in-memory auth token and SWR cache via the full reload
 * next-auth performs. */
export function useLogout(): () => void {
  return useCallback(() => {
    setAuthToken(undefined);
    const callbackUrl = process.env.NEXT_PUBLIC_LOGOUT_CALLBACK_URL || "/login";
    void signOut({ callbackUrl });
  }, []);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const user = (session as { user?: AuthUser } | null)?.user ?? null;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    setAuthToken(token);
    setReady(true);
  }, [status, token]);

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

  return (
    <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>
  );
}
