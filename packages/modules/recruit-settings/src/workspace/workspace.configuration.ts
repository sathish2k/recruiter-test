import type { FormSection, JsonSchema } from "@recruit/shared";

const NOTICE = ["Immediate", "15 days", "30 days", "60 days", "90 days"];
const OWNERS = ["Round-robin (auto)", "Account manager", "Creator", "Unassigned"];
const VISIBILITY = ["Everyone", "Team only", "Private"];
const WEEK_START = ["Monday", "Sunday", "Saturday"];
const DATE_FORMATS = ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"];
const TIME_FORMATS = ["12-hour (2:30 PM)", "24-hour (14:30)"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const text = (key: string, icon?: string) => ({
  type: "string" as const,
  title: `fields.${key}`,
  placeholder: `fields.${key}Placeholder`,
  ...(icon ? { icon } : {}),
});

const select = (key: string, values: string[]) => ({
  type: "string" as const,
  title: `fields.${key}`,
  enum: values,
});

const profileForm: JsonSchema = {
  type: "object",
  // Timezone, currency, language and the phone picker all source their options
  // from GET /reference — the widget fetches and caches, so the screen doesn't.
  properties: {
    // General
    logo: {
      // The value is `{ url, file }` — see UploadValue.
      type: "object",
      widget: "upload",
      title: "fields.logo",
      uploadLabel: "fields.logoUpload",
      help: "fields.logoHelp",
      accept: "image/png,image/svg+xml,image/jpeg,image/webp",
      maxSizeMb: 2,
      preview: "square",
    },
    name: text("name", "domain"),
    website: text("website", "link"),
    phone: {
      type: "string",
      widget: "phone",
      title: "fields.phone",
      placeholder: "fields.phonePlaceholder",
      optionSource: { url: "/reference", path: "data.dialCodes" },
    },
    officeAddress: text("officeAddress", "location"),
    // Options are injected at render from GET /reference — the full IANA list
    // straight off the runtime's ICU data.
    timezone: {
      type: "string" as const,
      widget: "select" as const,
      title: "fields.timezone",
      optionSource: { url: "/reference", path: "data.timezones" },
    },
    language: {
      type: "string" as const,
      widget: "select" as const,
      title: "fields.language",
      optionSource: { url: "/reference", path: "data.languages" },
    },
    // Email branding
    fromName: text("fromName"),
    fromEmail: { ...text("fromEmail", "mail"), format: "email" },
    replyTo: { ...text("replyTo", "mail"), format: "email" },
    emailSignature: { ...text("emailSignature"), widget: "markdown" },
    // Recruitment defaults
    placementFee: text("placementFee"),
    // Options injected at render from GET /reference (ISO 4217 via ICU).
    currency: {
      type: "string" as const,
      widget: "select" as const,
      title: "fields.currency",
      optionSource: { url: "/reference", path: "data.currencies" },
    },
    noticePeriod: select("noticePeriod", NOTICE),
    defaultOwner: select("defaultOwner", OWNERS),
    jobVisibility: select("jobVisibility", VISIBILITY),
    duplicateDetection: {
      type: "boolean",
      title: "fields.duplicateDetection",
      help: "fields.duplicateDetectionHelp",
    },
    // Formats & identifiers
    workingDays: {
      type: "array",
      widget: "days",
      title: "fields.workingDays",
      dayOptions: DAYS.map((d) => ({ value: d, label: d })),
      dayPresets: [
        { label: "presets.weekdays", values: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        { label: "presets.weekends", values: ["Sat", "Sun"] },
        { label: "presets.everyday", values: DAYS },
      ],
    },
    businessHours: text("businessHours", "schedule"),
    firstDayOfWeek: select("firstDayOfWeek", WEEK_START),
    dateFormat: select("dateFormat", DATE_FORMATS),
    timeFormat: select("timeFormat", TIME_FORMATS),
    candidatePrefix: text("candidatePrefix"),
    jobPrefix: text("jobPrefix"),
    clientPrefix: text("clientPrefix"),
    invoicePrefix: text("invoicePrefix"),
    // Report branding
    whiteLabel: {
      type: "boolean",
      title: "fields.whiteLabel",
      help: "fields.whiteLabelHelp",
    },
    accentColor: text("accentColor"),
  },
  required: ["name"],
  errorMessage: { required: { name: "fields.nameRequired" } },
};

const sections: FormSection[] = [
  {
    title: "sections.general",
    description: "sections.generalDescription",
    columns: 2,
    fields: [
      { name: "logo", span: 2 },
      "name",
      "website",
      "phone",
      { name: "officeAddress", span: 2 },
      "timezone",
      "language",
    ],
  },
  {
    title: "sections.emailBranding",
    description: "sections.emailBrandingDescription",
    columns: 2,
    fields: ["fromName", "fromEmail", "replyTo", { name: "emailSignature", span: 2 }],
  },
  {
    title: "sections.recruitmentDefaults",
    description: "sections.recruitmentDefaultsDescription",
    columns: 2,
    fields: [
      "placementFee",
      "currency",
      "noticePeriod",
      "defaultOwner",
      "jobVisibility",
      { name: "duplicateDetection", span: 2 },
    ],
  },
  {
    title: "sections.formats",
    description: "sections.formatsDescription",
    columns: 2,
    fields: [
      { name: "workingDays", span: 2 },
      "businessHours",
      "firstDayOfWeek",
      "dateFormat",
      "timeFormat",
      "candidatePrefix",
      "jobPrefix",
      "clientPrefix",
      "invoicePrefix",
    ],
  },
  {
    title: "sections.reportBranding",
    description: "sections.reportBrandingDescription",
    columns: 2,
    fields: [{ name: "whiteLabel", span: 2 }, "accentColor"],
  },
];

export const WorkspaceConfiguration: {
  profileForm: JsonSchema;
  sections: FormSection[];
} = { profileForm, sections };
