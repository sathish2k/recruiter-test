import type { Configuration } from "@recruit/sdk";

export const AuthPages: Record<string, Configuration> = {
  "Auth.Login.Configuration": {
    id: "Auth.Login.Configuration",
    elements: [
      {
        id: "auth-login",
        type: "component",
        componentType: "Auth.Login.Component",
      },
    ],
  },
  "Auth.CreateAccount.Configuration": {
    id: "Auth.CreateAccount.Configuration",
    elements: [
      {
        id: "auth-create-account",
        type: "component",
        componentType: "Auth.CreateAccount.Component",
      },
    ],
  },
  "Auth.ForgotPassword.Configuration": {
    id: "Auth.ForgotPassword.Configuration",
    elements: [
      {
        id: "auth-forgot-password",
        type: "component",
        componentType: "Auth.ForgotPassword.Component",
      },
    ],
  },
  "Auth.VerifyEmail.Configuration": {
    id: "Auth.VerifyEmail.Configuration",
    elements: [
      {
        id: "auth-verify-email",
        type: "component",
        componentType: "Auth.VerifyEmail.Component",
      },
    ],
  },
  "Auth.ResetPassword.Configuration": {
    id: "Auth.ResetPassword.Configuration",
    elements: [
      {
        id: "auth-reset-password",
        type: "component",
        componentType: "Auth.ResetPassword.Component",
      },
    ],
  },
};
