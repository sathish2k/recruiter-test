import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

const accentSx = {
  fontWeight: 600,
  color: "surface.primarySoftFg",
  textDecoration: "none",
  "&:hover": { color: "primary.light" },
};
const mutedSx = { color: "text.secondary", textDecoration: "none" };

const schema: JsonSchema = {
  type: "object",
  required: ["fullName", "email", "password"],
  errorMessage: {
    required: {
      fullName: "fullName.errors.required",
      email: "email.errors.required",
      password: "password.errors.required",
    },
  },
  properties: {
    fullName: {
      type: "string",
      minLength: 2,
      icon: "person",
      hideLabel: true,
      title: "fullName.label",
      placeholder: "fullName.placeholder",
      errorMessage: { minLength: "fullName.errors.minLength" },
    },
    agency: {
      type: "string",
      icon: "domain",
      hideLabel: true,
      title: "agency.label",
      placeholder: "agency.placeholder",
    },
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
      strengthMeter: true,
      title: "password.label",
      placeholder: "password.placeholder",
      errorMessage: { minLength: "password.errors.minLength" },
    },
  },
};

const links: Record<string, LinkRendererConfig> = {
  tos: { href: "#", text: "terms.tos", sx: mutedSx },
  privacy: { href: "#", text: "terms.privacy", sx: mutedSx },
  signIn: {
    routeId: "Auth.Login.Route",
    text: "footerLink",
    underline: "none",
    sx: accentSx,
  },
};

export const SignUpConfiguration = { schema, links };
