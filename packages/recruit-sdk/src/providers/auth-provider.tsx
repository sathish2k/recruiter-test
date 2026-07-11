"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useSession } from "next-auth/react";
import {
  createContext,
  type ReactNode,
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

// Shows a loader until the session resolves, then feeds the token to the
// httpClient interceptor via setAuthToken — so no request fires before the
// token is attached. Also exposes the session user via useAuthUser(). Requires
// next-auth's SessionProvider as an ancestor.
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
