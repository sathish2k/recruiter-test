"use client";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { useSession } from "next-auth/react";
import { type ReactNode, useEffect, useState } from "react";
import { setAuthToken } from "../client";

// Shows a loader until the session resolves, then feeds the token to the
// httpClient interceptor via setAuthToken — so no request fires before the
// token is attached. Requires next-auth's SessionProvider as an ancestor.
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
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

  return <>{children}</>;
}
