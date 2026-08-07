import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

// The design links in the action colour at 13/600, underline on hover only.
const accentSx = {
  fontSize: 13,
  fontWeight: 600,
  color: "surface.linkFg",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
};

// No validation on the login screen — fields submit as-is and the API decides.
const schema: JsonSchema = {
  type: "object",
  properties: {
    email: {
      type: "string",
      icon: "mail",
      title: "email.label",
      placeholder: "email.placeholder",
    },
    password: {
      type: "string",
      format: "password",
      icon: "lock",
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
    sx: accentSx,
  },
  signUp: {
    routeId: "Auth.CreateAccount.Route",
    text: "footerLink",
    underline: "none",
    sx: { ...accentSx, fontWeight: 700 },
  },
};

export const SignInConfiguration = { schema, links };
