import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "#F0B27C",
  textDecoration: "none",
  "&:hover": { color: "#FF8A3C" },
};

const schema: JsonSchema = {
  type: "object",
  required: ["password", "confirmPassword"],
  errorMessage: {
    required: {
      password: "password.errors.required",
      confirmPassword: "confirmPassword.errors.required",
    },
  },
  properties: {
    password: {
      type: "string",
      format: "password",
      minLength: 8,
      icon: "lock",
      hideLabel: true,
      strengthMeter: true,
      title: "password.label",
      placeholder: "password.placeholder",
      errorMessage: { minLength: "password.errors.minLength" },
    },
    confirmPassword: {
      type: "string",
      format: "password",
      icon: "lock-reset",
      hideLabel: true,
      matchesField: "password",
      title: "confirmPassword.label",
      placeholder: "confirmPassword.placeholder",
      errorMessage: { matches: "confirmPassword.errors.matches" },
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

export const ResetPasswordConfiguration = { schema, links };
