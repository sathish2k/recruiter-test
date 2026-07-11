"use client";

import { setApiToken } from "@recruit/sdk";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { mutate } from "swr";

export function AuthTokenSync() {
  const { data: session } = useSession();
  const token = session?.accessToken;
  useEffect(() => {
    setApiToken(token);
    mutate(() => true);
  }, [token]);
  return null;
}
