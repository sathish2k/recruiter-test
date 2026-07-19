import type { RouteGuardFn } from "@recruit/sdk";
import { redirect } from "next/navigation";
import { getServerSession } from "./access";

export const guards: Record<string, RouteGuardFn> = {
  authenticationGuard: async () => {
    const session = await getServerSession();
    if (!session) redirect("/login");
  },
};
