"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";
import { canAccess } from "../access";
import type { AccessContext, AccessRule } from "../types";

const AccessCtx = createContext<AccessContext | null>(null);

export function AccessProvider({
  value,
  children,
}: {
  value: AccessContext | null;
  children: ReactNode;
}) {
  return <AccessCtx.Provider value={value}>{children}</AccessCtx.Provider>;
}

export function useAccess(): {
  context: AccessContext | null;
  can: (rule?: AccessRule) => boolean;
} {
  const context = useContext(AccessCtx);
  return useMemo(
    () => ({ context, can: (rule?: AccessRule) => canAccess(context, rule) }),
    [context],
  );
}
