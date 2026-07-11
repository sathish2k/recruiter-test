import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "#F0B27C",
  textDecoration: "none",
  "&:hover": { color: "#FF8A3C" },
};

const schema: JsonSchema = {
  type: "object",
  required: ["email", "password"],
  errorMessage: {
    required: {
      email: "email.errors.required",
      password: "password.errors.required",
    },
  },
  properties: {
    email: {
      type: "string",
      format: "email",
      icon: "mail",
      hideLabel: true,
      title: "email.label",
      placeholder: "email.placeholder",
      errorMessage: { format: "email.errors.format" },
    },
    password: {
      type: "string",
      format: "password",
      minLength: 8,
      icon: "lock",
      hideLabel: true,
      title: "password.label",
      placeholder: "password.placeholder",
      errorMessage: { minLength: "password.errors.minLength" },
    },
  },
};

const links: Record<string, LinkRendererConfig> = {
  forgot: {
    href: "#",
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
