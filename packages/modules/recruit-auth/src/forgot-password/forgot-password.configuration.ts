import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "surface.primarySoftFg",
  textDecoration: "none",
  "&:hover": { color: "primary.light" },
};

const schema: JsonSchema = {
  type: "object",
  required: ["email"],
  errorMessage: { required: { email: "email.errors.required" } },
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
  },
};

const links: Record<string, LinkRendererConfig> = {
  signIn: {
    routeId: "Auth.Login.Route",
    text: "backToLogin",
    underline: "none",
    sx: accentSx,
  },
};

export const ForgotPasswordConfiguration = { schema, links };
