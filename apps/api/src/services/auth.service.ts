import { UserModel } from "../models/user.model";

export interface RegisterInput {
  fullName: string;
  agency: string;
  email: string;
  password: string;
}

export async function registerAccount(input: RegisterInput) {
  const passwordHash = await Bun.password.hash(input.password);
  // ponytail: agency name stored directly as agencyId until an Agency model
  // exists — swap for a real agency lookup/create when tenants get built.
  const user = await UserModel.create({
    agencyId: input.agency,
    email: input.email,
    name: input.fullName,
    role: "lead",
    passwordHash,
  });
  return { id: String(user._id), email: user.email, name: user.name };
}

export interface Credentials {
  email: string;
  password: string;
}

export async function verifyCredentials({ email, password }: Credentials) {
  const user = await UserModel.findOne({ email: email.toLowerCase() });
  if (!user) return null;
  const ok = await Bun.password.verify(password, user.passwordHash);
  if (!ok) return null;
  return {
    id: String(user._id),
    agencyId: user.agencyId,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}
