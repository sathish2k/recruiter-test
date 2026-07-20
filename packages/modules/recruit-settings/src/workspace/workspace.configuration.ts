import type { FormSection, JsonSchema } from "@recruit/shared";

const TIMEZONES = [
  "IST (GMT+5:30)",
  "GMT (GMT+0:00)",
  "CET (GMT+1:00)",
  "EST (GMT-5:00)",
  "PST (GMT-8:00)",
  "SGT (GMT+8:00)",
  "AEST (GMT+10:00)",
];
const LANGUAGES = ["English (India)", "English (US)", "English (UK)", "Deutsch", "Español"];
const CURRENCIES = [
  "₹ INR — Indian Rupee",
  "$ USD — US Dollar",
  "£ GBP — British Pound",
  "€ EUR — Euro",
  "S$ SGD — Singapore Dollar",
];
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
  properties: {
    // General
    name: text("name", "domain"),
    website: text("website", "link"),
    phone: text("phone", "call"),
    officeAddress: text("officeAddress", "location"),
    timezone: select("timezone", TIMEZONES),
    language: select("language", LANGUAGES),
    // Email branding
    fromName: text("fromName"),
    fromEmail: { ...text("fromEmail", "mail"), format: "email" },
    replyTo: { ...text("replyTo", "mail"), format: "email" },
    emailSignature: { ...text("emailSignature"), widget: "markdown" },
    // Recruitment defaults
    placementFee: text("placementFee"),
    currency: select("currency", CURRENCIES),
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
      title: "fields.workingDays",
      help: "fields.workingDaysHelp",
      enum: DAYS,
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
