import type { RouteGuardFn } from "@recruit/sdk";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "./auth";

export const guards: Record<string, RouteGuardFn> = {
  authenticationGuard: async () => {
    const session = await getServerSession(authOptions);
    if (!session) redirect("/login");
  },
};
