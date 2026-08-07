import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "surface.linkFg",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
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
