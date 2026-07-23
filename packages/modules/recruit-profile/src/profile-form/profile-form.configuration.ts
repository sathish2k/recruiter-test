import type { FormSection, JsonSchema } from "@recruit/shared";

export interface ProfileFormConfiguration {
  schema: JsonSchema;
  sections: FormSection[];
  workspace: {
    /** Route id the "Open Workspace Settings" link navigates to. */
    settingsRouteId: string;
  };
}

const schema: JsonSchema = {
  type: "object",
  properties: {
    avatar: {
      type: "object",
      widget: "upload",
      preview: "circle",
      hideLabel: true,
      uploadLabel: "profile.uploadPhoto",
      accept: "image/png,image/jpeg,image/webp",
      maxSizeMb: 2,
      help: "profile.photoHint",
    },
    name: {
      type: "string",
      title: "profile.fields.name",
      placeholder: "profile.fields.namePlaceholder",
    },
    email: {
      // Read-only sign-in identity; stripped from the payload before save.
      type: "string",
      format: "email",
      readOnly: true,
      title: "profile.fields.email",
      help: "profile.fields.emailHint",
    },
    phone: {
      type: "string",
      widget: "phone",
      title: "profile.fields.phone",
      placeholder: "profile.fields.phonePlaceholder",
      optionSource: { url: "/reference", path: "data.dialCodes" },
      errorMessage: { phone: "profile.fields.phoneInvalid" },
    },
    timezone: {
      // Full IANA list off the runtime's ICU data — same source as workspace.
      type: "string",
      widget: "select",
      title: "profile.fields.timezone",
      optionSource: { url: "/reference", path: "data.timezones" },
    },
    signature: {
      type: "string",
      widget: "textarea",
      rows: 5,
      title: "signature.title",
      placeholder: "signature.placeholder",
    },
  },
  required: ["name"],
  errorMessage: { required: { name: "profile.fields.nameRequired" } },
};

const sections: FormSection[] = [
  {
    title: "profile.title",
    columns: 2,
    fields: [{ name: "avatar", span: 2 }, "name", "email", "phone", "timezone"],
  },
  {
    title: "signature.title",
    description: "signature.description",
    columns: 1,
    fields: ["signature"],
  },
];

export const ProfileFormConfiguration: ProfileFormConfiguration = {
  schema,
  sections,
  workspace: {
    settingsRouteId: "Recruit.Settings.Route",
  },
};
