import type { Module } from "@recruit/sdk";
import { BACKDROP_COMPONENT } from "./backdrop/bootstrap";
import { SIGN_IN_COMPONENT } from "./sign-in/bootstrap";
import { SIGN_UP_COMPONENT } from "./sign-up/bootstrap";

export const AuthModule: Module = {
  id: "Auth.Module",
  components: [BACKDROP_COMPONENT, SIGN_IN_COMPONENT, SIGN_UP_COMPONENT],
};
