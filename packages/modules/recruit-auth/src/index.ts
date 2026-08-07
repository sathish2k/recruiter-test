import type { Module } from "@recruit/sdk";
import { SIGN_IN_COMPONENT } from "./sign-in/bootstrap";

export const AuthModule: Module = {
  id: "Auth.Module",
  components: [SIGN_IN_COMPONENT],
};
