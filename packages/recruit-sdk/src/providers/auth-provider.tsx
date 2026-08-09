"use client";

import { createAuthClient } from "better-auth/react";
import { usePathname } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { BrandLoaderScreen } from "../brand-loader";
import { setAuthToken, setSessionLostHandler } from "../client";
import { SessionExpired } from "../session-expired";

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

export function AuthProvider({
  children,
  publicPaths = [],
}: {
  children: ReactNode;
  /** Paths (exact match) that render without waiting for the session — a guest
   * screen gated behind the loader would otherwise blank the server-rendered
   * HTML and push LCP past the whole hydrate-then-fetch round trip. */
  publicPaths?: string[];
}) {
  const { data, isPending } = authClient.useSession();
  const pathname = usePathname();
  const token = data?.session?.token;
  const user = (data?.user as AuthUser | undefined) ?? null;
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const logout = useLogout();

  useEffect(() => {
    if (isPending) return;
    setAuthToken(token);
    setReady(true);
  }, [isPending, token]);

  // A session that dies mid-visit used to surface as whichever failure the
  // calling screen happened to render. Now it replaces the screen, once.
  useEffect(() => {
    setSessionLostHandler(() => setExpired(true));
    return () => setSessionLostHandler(undefined);
  }, []);

  const isPublic = pathname != null && publicPaths.includes(pathname);
  if (!ready && !isPublic) return <BrandLoaderScreen />;
  if (expired) return <SessionExpired onSignIn={logout} />;

  return <AuthUserContext.Provider value={user}>{children}</AuthUserContext.Provider>;
}
