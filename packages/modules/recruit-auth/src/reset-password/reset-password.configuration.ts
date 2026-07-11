import type { JsonSchema } from "@recruit/shared";

const schema: JsonSchema = {
  type: "object",
  required: ["password"],
  errorMessage: { required: { password: "password.errors.required" } },
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
  },
};

export const ResetPasswordConfiguration = { schema };
