import type { FormSection, JsonSchema } from "@recruit/shared";

/** Half-hour marks — the options behind the business-hours pickers. */
const HOURS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 ? "30" : "00";
  const suffix = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${suffix}`;
});

const profileForm: JsonSchema = {
  type: "object",
  // Timezone, currency, language and the phone picker all source their options
  // from GET /reference — the widget fetches and caches, so the screen doesn't.
  properties: {
    // ── General ────────────────────────────────────────────────────────────
    logo: {
      // The value is `{ url, file }` — see UploadValue.
      type: "object",
      widget: "upload",
      title: "fields.logo",
      uploadLabel: "fields.logoUpload",
      help: "fields.logoHelp",
      helpSecondary: "fields.logoHelpSecondary",
      accept: "image/png,image/svg+xml,image/jpeg,image/webp",
      maxSizeMb: 2,
      preview: "square",
    },
    name: {
      type: "string",
      title: "fields.name",
      placeholder: "fields.namePlaceholder",
    },
    website: {
      type: "string",
      title: "fields.website",
      placeholder: "fields.websitePlaceholder",
    },
    phone: {
      type: "string",
      widget: "phone",
      title: "fields.phone",
      placeholder: "fields.phonePlaceholder",
      optionSource: { url: "/reference", path: "data.dialCodes" },
    },
    // One field holding `{ street, city, state, postalCode, country }` — the
    // design labels the group once and gives the row under Street its own
    // proportions and gap.
    officeAddress: {
      type: "object",
      widget: "addressGroup",
      title: "fields.officeAddress",
    },
    // The full IANA list, straight off the runtime's ICU data.
    timezone: {
      type: "string",
      widget: "select",
      title: "fields.timezone",
      optionSource: { url: "/reference", path: "data.timezones" },
    },
    language: {
      type: "string",
      widget: "select",
      title: "fields.language",
      optionSource: { url: "/reference", path: "data.languages" },
    },

    // ── Email branding ─────────────────────────────────────────────────────
    fromName: {
      type: "string",
      title: "fields.fromName",
      placeholder: "fields.fromNamePlaceholder",
    },
    fromEmail: {
      type: "string",
      format: "email",
      title: "fields.fromEmail",
      placeholder: "fields.fromEmailPlaceholder",
    },
    replyTo: {
      type: "string",
      format: "email",
      title: "fields.replyTo",
      placeholder: "fields.replyToPlaceholder",
    },
    bcc: {
      type: "string",
      format: "email",
      title: "fields.bcc",
      placeholder: "fields.bccPlaceholder",
    },
    emailSignature: {
      type: "string",
      widget: "textarea",
      rows: 4,
      title: "fields.emailSignature",
      placeholder: "fields.emailSignaturePlaceholder",
      help: "fields.emailSignatureHelp",
    },

    // ── Recruitment defaults ───────────────────────────────────────────────
    placementFee: {
      type: "number",
      widget: "number",
      title: "fields.placementFee",
      placeholder: "fields.placementFeePlaceholder",
      unit: "fields.placementFeeUnit",
      unitPosition: "end",
      help: "fields.placementFeeHelp",
      minimum: 0,
      maximum: 100,
      step: 0.01,
    },
    // ISO 4217, via ICU.
    currency: {
      type: "string",
      widget: "select",
      title: "fields.currency",
      optionSource: { url: "/reference", path: "data.currencies" },
      help: "fields.currencyHelp",
    },
    noticePeriod: {
      type: "string",
      title: "fields.noticePeriod",
      enum: ["Immediate", "15 days", "30 days", "60 days", "90 days"],
    },
    resumePrivacy: {
      type: "string",
      title: "fields.resumePrivacy",
      enum: ["Full details", "Masked until shortlist", "Masked until offer"],
      help: "fields.resumePrivacyHelp",
    },
    // Real teammates, searched server-side — GET /users?search=…
    defaultOwner: {
      type: "string",
      widget: "ownerPicker",
      title: "fields.defaultOwner",
      placeholder: "fields.defaultOwnerPlaceholder",
      help: "fields.defaultOwnerHelp",
      optionSource: {
        url: "/users",
        path: "data",
        valueKey: "name",
        labelKey: "name",
        searchParam: "search",
      },
    },
    jobVisibility: {
      type: "string",
      widget: "segmented",
      title: "fields.jobVisibility",
      enum: ["Everyone", "Team only", "Private"],
    },
    workingDays: {
      type: "array",
      widget: "days",
      title: "fields.workingDays",
      dayOptions: [
        { value: "Mon", label: "Mon" },
        { value: "Tue", label: "Tue" },
        { value: "Wed", label: "Wed" },
        { value: "Thu", label: "Thu" },
        { value: "Fri", label: "Fri" },
        { value: "Sat", label: "Sat" },
        { value: "Sun", label: "Sun" },
      ],
      dayPresets: [
        { label: "presets.weekdays", values: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        { label: "presets.weekends", values: ["Sat", "Sun"] },
        { label: "presets.everyday", values: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
      ],
    },
    // One field holding `{ from, to }` — labelled once, with the two pickers
    // nested under FROM / TO captions.
    businessHours: {
      type: "object",
      widget: "hoursRange",
      title: "fields.businessHours",
      enum: HOURS,
      help: "fields.businessHoursHelp",
    },
    firstDayOfWeek: {
      type: "string",
      widget: "segmented",
      title: "fields.firstDayOfWeek",
      enum: ["Monday", "Sunday", "Saturday"],
    },
    duplicateDetection: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.duplicateDetection",
      help: "fields.duplicateDetectionHelp",
    },
    duplicateIdentifiers: {
      type: "array",
      widget: "checkbox-group",
      title: "fields.duplicateIdentifiers",
      hideLabel: true,
      enum: ["Email", "Phone", "LinkedIn URL", "Resume hash"],
      row: true,
      help: "fields.duplicateIdentifiersHelp",
    },

    // ── Formats & identifiers ──────────────────────────────────────────────
    dateFormat: {
      type: "string",
      title: "fields.dateFormat",
      enum: ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"],
    },
    timeFormat: {
      type: "string",
      title: "fields.timeFormat",
      enum: ["12-hour (2:30 PM)", "24-hour (14:30)"],
    },
    candidatePrefix: {
      type: "string",
      widget: "prefixPreview",
      title: "fields.candidatePrefix",
      placeholder: "fields.candidatePrefixPlaceholder",
    },
    jobPrefix: {
      type: "string",
      widget: "prefixPreview",
      title: "fields.jobPrefix",
      placeholder: "fields.jobPrefixPlaceholder",
    },
    clientPrefix: {
      type: "string",
      widget: "prefixPreview",
      title: "fields.clientPrefix",
      placeholder: "fields.clientPrefixPlaceholder",
    },
    invoicePrefix: {
      type: "string",
      widget: "prefixPreview",
      title: "fields.invoicePrefix",
      placeholder: "fields.invoicePrefixPlaceholder",
    },

    // ── Report branding ────────────────────────────────────────────────────
    whiteLabel: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.whiteLabel",
      help: "fields.whiteLabelHelp",
      badge: "fields.whiteLabelBadge",
      badgeIcon: "star",
    },
    accentColor: {
      type: "string",
      widget: "accentSwatches",
      title: "fields.accentColor",
      help: "fields.accentColorHelp",
    },
  },
  required: ["name"],
  errorMessage: { required: { name: "fields.nameRequired" } },
};

const sections: FormSection[] = [
  {
    title: "sections.general",
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
    fields: ["fromName", "fromEmail", "replyTo", "bcc", { name: "emailSignature", span: 2 }],
  },
  {
    title: "sections.recruitmentDefaults",
    description: "sections.recruitmentDefaultsDescription",
    columns: 2,
    fields: [
      "placementFee",
      "currency",
      "noticePeriod",
      "resumePrivacy",
      "defaultOwner",
      "jobVisibility",
      "workingDays",
      "businessHours",
      "firstDayOfWeek",
      { name: "duplicateDetection", span: 2 },
      { name: "duplicateIdentifiers", span: 2 },
    ],
  },
  {
    title: "sections.formats",
    description: "sections.formatsDescription",
    columns: 2,
    fields: [
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
    fields: [
      { name: "whiteLabel", span: 2 },
      { name: "accentColor", span: 2 },
    ],
  },
];

export const WorkspaceConfiguration: {
  profileForm: JsonSchema;
  sections: FormSection[];
} = { profileForm, sections };
