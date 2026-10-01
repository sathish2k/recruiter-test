import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

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
  changeEmail: { routeId: "Auth.CreateAccount.Route", underline: "none" },
  signIn: { routeId: "Auth.Login.Route", underline: "none" },
  getStarted: { routeId: "Recruit.GetStarted.Route", underline: "none" },
};

export const VerifyEmailConfiguration = { schema, links };
