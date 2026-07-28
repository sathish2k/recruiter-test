import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "surface.primarySoftFg",
  textDecoration: "none",
  "&:hover": { color: "primary.light" },
};

const schema: JsonSchema = {
  type: "object",
  required: ["code"],
  errorMessage: { required: { code: "code.errors.required" } },
  properties: {
    code: {
      type: "string",
      widget: "verification-code",
      hideLabel: true,
      title: "code.label",
      placeholder: "code.placeholder",
      minLength: 6,
      maxLength: 6,
      pattern: "^[0-9]{6}$",
      errorMessage: {
        pattern: "code.errors.format",
        minLength: "code.errors.format",
        maxLength: "code.errors.format",
      },
    },
  },
};

const links: Record<string, LinkRendererConfig> = {
  // "Use a different email" goes back to sign-up, not to login — the address
  // they need to change is the one they just registered with.
  changeEmail: { routeId: "Auth.CreateAccount.Route", underline: "none", sx: accentSx },
  signIn: { routeId: "Auth.Login.Route", underline: "none", sx: accentSx },
  getStarted: { routeId: "Recruit.GetStarted.Route", underline: "none" },
};

export const VerifyEmailConfiguration = { schema, links };
