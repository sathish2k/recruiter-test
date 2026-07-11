import { jwt } from "@elysiajs/jwt";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error("JWT_SECRET is not set");

export const jwtPlugin = jwt({ name: "jwt", secret: JWT_SECRET, exp: "30d" });

export interface JwtSigner {
  sign: (payload: Record<string, string | number>) => Promise<string>;
}
