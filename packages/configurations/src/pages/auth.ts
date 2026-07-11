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
};
