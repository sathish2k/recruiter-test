import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "surface.primarySoftFg",
  textDecoration: "none",
  "&:hover": { color: "primary.light" },
};

// No validation on the login screen — fields submit as-is and the API decides.
const schema: JsonSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      icon: "mail",
      hideLabel: true,
      title: "email.label",
      placeholder: "email.placeholder",
    },
    password: {
      type: "string",
      format: "password",
      icon: "lock",
      hideLabel: true,
      title: "password.label",
      placeholder: "password.placeholder",
    },
  },
};

const links: Record<string, LinkRendererConfig> = {
  forgot: {
    routeId: "Auth.ForgotPassword.Route",
    text: "forgot",
    underline: "none",
    sx: { fontSize: 12.5, ...accentSx },
  },
  signUp: {
    routeId: "Auth.CreateAccount.Route",
    text: "footerLink",
    underline: "none",
    sx: accentSx,
  },
};

export const SignInConfiguration = { schema, links };
