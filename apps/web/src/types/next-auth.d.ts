import type { UserRole } from "@recruit/types";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: UserRole;
      agencyId?: string;
    };
  }
  interface User {
    id: string;
    role?: UserRole;
    agencyId?: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    role?: UserRole;
    agencyId?: string;
  }
}
