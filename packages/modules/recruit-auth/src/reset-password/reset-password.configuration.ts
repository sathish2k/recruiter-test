import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

// The design links in the action colour at 13/600, underline on hover only.
const accentSx = {
  fontSize: 13,
  fontWeight: 600,
  color: "surface.linkFg",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
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
      strengthMeter: true,
      title: "password.label",
      placeholder: "password.placeholder",
      errorMessage: { minLength: "password.errors.minLength" },
    },
    confirmPassword: {
      type: "string",
      format: "password",
      icon: "lock-reset",
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
  // The invalid-link state sends the user back to request a new one.
  forgot: { routeId: "Auth.ForgotPassword.Route", underline: "none" },
};

export const ResetPasswordConfiguration = { schema, links };
