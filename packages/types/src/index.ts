export type UserRole = "lead" | "recruiter";

export interface User {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  role: UserRole;
}
