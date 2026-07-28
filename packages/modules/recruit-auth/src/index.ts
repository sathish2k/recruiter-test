import type { Module } from "@recruit/sdk";
import { BACKDROP_COMPONENT } from "./backdrop/bootstrap";
import { FORGOT_PASSWORD_COMPONENT } from "./forgot-password/bootstrap";
import { RESET_PASSWORD_COMPONENT } from "./reset-password/bootstrap";
import { SIGN_IN_COMPONENT } from "./sign-in/bootstrap";
import { SIGN_UP_COMPONENT } from "./sign-up/bootstrap";
import { VERIFY_EMAIL_COMPONENT } from "./verify-email/bootstrap";

export const AuthModule: Module = {
  id: "Auth.Module",
  components: [
    BACKDROP_COMPONENT,
    SIGN_IN_COMPONENT,
    SIGN_UP_COMPONENT,
    FORGOT_PASSWORD_COMPONENT,
    RESET_PASSWORD_COMPONENT,
    VERIFY_EMAIL_COMPONENT,
  ],
};
