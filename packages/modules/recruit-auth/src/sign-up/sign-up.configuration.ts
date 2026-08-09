import type { JsonSchema, LinkRendererConfig } from "@recruit/shared";

// The design links in the action colour at 13/600, underline on hover only.
const accentSx = {
  fontSize: 13,
  fontWeight: 600,
  color: "surface.linkFg",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
};
// Links inside a sentence take the sentence's own size.
const inlineSx = {
  fontSize: "inherit",
  fontWeight: 700,
  color: "surface.linkFg",
  textDecoration: "none",
  "&:hover": { textDecoration: "underline" },
};

const schema: JsonSchema = {
  type: "object",
  required: ["firstName", "lastName", "agency", "email", "password"],
  errorMessage: {
    required: {
      firstName: "firstName.errors.required",
      lastName: "lastName.errors.required",
      agency: "agency.errors.required",
      email: "email.errors.required",
      password: "password.errors.required",
    },
  },
  properties: {
    firstName: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      icon: "person",
      title: "firstName.label",
      placeholder: "firstName.placeholder",
      grid: { size: { xs: 12, sm: 6 } },
      errorMessage: {
        minLength: "firstName.errors.minLength",
        maxLength: "firstName.errors.maxLength",
      },
    },
    lastName: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      icon: "person",
      title: "lastName.label",
      placeholder: "lastName.placeholder",
      grid: { size: { xs: 12, sm: 6 } },
      errorMessage: {
        minLength: "lastName.errors.minLength",
        maxLength: "lastName.errors.maxLength",
      },
    },
    agency: {
      type: "string",
      minLength: 2,
      maxLength: 50,
      icon: "domain",
      title: "agency.label",
      placeholder: "agency.placeholder",
      grid: { size: 12 },
      errorMessage: {
        minLength: "agency.errors.minLength",
        maxLength: "agency.errors.maxLength",
      },
    },
    email: {
      type: "string",
      format: "email",
      icon: "mail",
      title: "email.label",
      placeholder: "email.placeholder",
      grid: { size: 12 },
      errorMessage: { format: "email.errors.format" },
    },
    password: {
      type: "string",
      format: "password",
      minLength: 8,
      icon: "lock",
      strengthMeter: true,
      title: "password.label",
      placeholder: "password.placeholder",
      grid: { size: 12 },
      errorMessage: { minLength: "password.errors.minLength" },
    },
  },
};

const links: Record<string, LinkRendererConfig> = {
  tos: { routeId: "Recruit.Terms.Route", text: "terms.tos", sx: inlineSx },
  privacy: { routeId: "Recruit.Privacy.Route", text: "terms.privacy", sx: inlineSx },
  signIn: {
    routeId: "Auth.Login.Route",
    text: "footerLink",
    underline: "none",
    sx: accentSx,
  },
};

// The design pairs the two name fields on one row; everything below runs full
// width. A field's `grid.size` counts in these 12 columns.
const gridContainer = { columns: 12, spacing: "16px" } as const;

export const SignUpConfiguration = { schema, links, gridContainer };
