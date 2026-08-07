import type { FormSection, JsonSchema } from "@recruit/shared";

/** Half-hour marks — the options behind the business-hours pickers. */
const HOURS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 ? "30" : "00";
  const suffix = hour24 < 12 ? "AM" : "PM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${minute} ${suffix}`;
});

/** Every workspace field the four settings tabs draw from. Each tab exports its
 * own schema below holding only the properties it edits, so a partial save
 * carries nothing the tab does not show — the API merges the patch. */
export interface WorkspaceFormConfiguration {
  profileForm: JsonSchema;
  sections: FormSection[];
}

// ── General ──────────────────────────────────────────────────────────────────

const generalForm: JsonSchema = {
  type: "object",
  // Timezone, currency, language and the phone picker all source their options
  // from GET /reference — the widget fetches and caches, so the screen doesn't.
  properties: {
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
    feedbackSla: {
      type: "string",
      title: "fields.feedbackSla",
      enum: ["24 hours", "48 hours", "72 hours", "5 working days"],
      help: "fields.feedbackSlaHelp",
    },
    replacementPeriod: {
      type: "string",
      title: "fields.replacementPeriod",
      enum: ["30 days", "60 days", "90 days", "None"],
      help: "fields.replacementPeriodHelp",
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
    autoScreen: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.autoScreen",
      help: "fields.autoScreenHelp",
    },
    blockUnsigned: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.blockUnsigned",
      help: "fields.blockUnsignedHelp",
    },
    weeklyReport: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.weeklyReport",
      help: "fields.weeklyReportHelp",
    },
    portalCv: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.portalCv",
      help: "fields.portalCvHelp",
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
    prefixLock: {
      type: "string",
      widget: "callout",
      variant: "banner",
      tone: "info",
      icon: "lock",
      help: "fields.prefixLockHelp",
    },
  },
  required: ["name"],
  errorMessage: { required: { name: "fields.nameRequired" } },
};

const generalSections: FormSection[] = [
  {
    title: "sections.agency",
    description: "sections.agencyDescription",
    columns: 2,
    fields: [
      { name: "logo", span: 2 },
      "name",
      "website",
      "phone",
      { name: "officeAddress", span: 2 },
    ],
  },
  {
    title: "sections.recruitmentDefaults",
    description: "sections.recruitmentDefaultsDescription",
    columns: 3,
    fields: [
      "placementFee",
      "feedbackSla",
      "replacementPeriod",
      "currency",
      "noticePeriod",
      "resumePrivacy",
      { name: "defaultOwner", span: 2 },
      "jobVisibility",
      { name: "autoScreen", span: 3 },
      { name: "blockUnsigned", span: 3 },
      { name: "weeklyReport", span: 3 },
      { name: "portalCv", span: 3 },
      { name: "duplicateDetection", span: 3 },
      { name: "duplicateIdentifiers", span: 3 },
    ],
  },
  {
    title: "sections.formats",
    description: "sections.formatsDescription",
    columns: 2,
    fields: [
      "candidatePrefix",
      "jobPrefix",
      "clientPrefix",
      "invoicePrefix",
      { name: "prefixLock", span: 2 },
    ],
  },
];

export const GeneralConfiguration: WorkspaceFormConfiguration = {
  profileForm: generalForm,
  sections: generalSections,
};

// ── Branding ─────────────────────────────────────────────────────────────────

const brandingForm: JsonSchema = {
  type: "object",
  properties: {
    accentColor: {
      type: "string",
      widget: "accentSwatches",
      title: "fields.accentColor",
      help: "fields.accentColorHelp",
    },
    contrastNote: {
      type: "string",
      widget: "callout",
      variant: "banner",
      tone: "info",
      icon: "check-circle",
      help: "fields.contrastNoteHelp",
    },
    whiteLabel: {
      type: "boolean",
      widget: "switch-row",
      title: "fields.whiteLabel",
      help: "fields.whiteLabelHelp",
      badge: "fields.whiteLabelBadge",
      badgeIcon: "star",
    },
  },
};

const brandingSections: FormSection[] = [
  {
    title: "sections.brandColour",
    description: "sections.brandColourDescription",
    fields: ["accentColor", "contrastNote"],
  },
  {
    title: "sections.reportBranding",
    description: "sections.reportBrandingDescription",
    fields: ["whiteLabel"],
  },
];

export const BrandingConfiguration: WorkspaceFormConfiguration = {
  profileForm: brandingForm,
  sections: brandingSections,
};

// ── Localization ─────────────────────────────────────────────────────────────

const localizationForm: JsonSchema = {
  type: "object",
  properties: {
    language: {
      type: "string",
      widget: "select",
      title: "fields.language",
      optionSource: { url: "/reference", path: "data.languages" },
      help: "fields.languageHelp",
    },
    // The full IANA list, straight off the runtime's ICU data.
    timezone: {
      type: "string",
      widget: "select",
      title: "fields.timezone",
      optionSource: { url: "/reference", path: "data.timezones" },
    },
    currency: {
      type: "string",
      widget: "select",
      title: "fields.currency",
      optionSource: { url: "/reference", path: "data.currencies" },
    },
    dateFormat: {
      type: "string",
      title: "fields.dateFormat",
      enum: ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD", "DD.MM.YYYY"],
    },
    timeFormat: {
      type: "string",
      title: "fields.timeFormat",
      enum: ["12-hour (2:30 PM)", "24-hour (14:30)"],
    },
    numberFormat: {
      type: "string",
      title: "fields.numberFormat",
      enum: ["1,000.00", "1.000,00", "1 000,00"],
    },
    firstDayOfWeek: {
      type: "string",
      widget: "segmented",
      title: "fields.firstDayOfWeek",
      enum: ["Monday", "Sunday", "Saturday"],
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
    slaNote: {
      type: "string",
      widget: "callout",
      variant: "banner",
      tone: "accent",
      icon: "timer",
      help: "fields.slaNoteHelp",
    },
  },
};

const localizationSections: FormSection[] = [
  {
    title: "sections.language",
    description: "sections.languageDescription",
    fields: ["language"],
  },
  {
    title: "sections.regionalFormats",
    description: "sections.regionalFormatsDescription",
    columns: 3,
    fields: ["timezone", "currency", "dateFormat", "timeFormat", "numberFormat", "firstDayOfWeek"],
  },
  {
    title: "sections.workingTime",
    description: "sections.workingTimeDescription",
    columns: 2,
    fields: ["businessHours", "workingDays", { name: "slaNote", span: 2 }],
  },
];

export const LocalizationConfiguration: WorkspaceFormConfiguration = {
  profileForm: localizationForm,
  sections: localizationSections,
};

// ── Email ────────────────────────────────────────────────────────────────────

const emailForm: JsonSchema = {
  type: "object",
  properties: {
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
      help: "fields.fromEmailHelp",
    },
    replyTo: {
      type: "string",
      format: "email",
      title: "fields.replyTo",
      placeholder: "fields.replyToPlaceholder",
      help: "fields.replyToHelp",
    },
    bcc: {
      type: "string",
      format: "email",
      title: "fields.bcc",
      placeholder: "fields.bccPlaceholder",
    },
    dnsNote: {
      type: "string",
      widget: "callout",
      variant: "banner",
      tone: "info",
      icon: "verified-user",
      help: "fields.dnsNoteHelp",
    },
    emailSignature: {
      type: "string",
      widget: "textarea",
      rows: 4,
      title: "fields.emailSignature",
      placeholder: "fields.emailSignaturePlaceholder",
      help: "fields.emailSignatureHelp",
    },
    emailFooter: {
      type: "string",
      widget: "callout",
      variant: "banner",
      tone: "info",
      icon: "info",
      help: "fields.emailFooterHelp",
    },
  },
};

const emailSections: FormSection[] = [
  {
    title: "sections.addresses",
    description: "sections.addressesDescription",
    columns: 2,
    fields: ["fromName", "fromEmail", "replyTo", "bcc", { name: "dnsNote", span: 2 }],
  },
  {
    title: "sections.signature",
    description: "sections.signatureDescription",
    fields: ["emailSignature", "emailFooter"],
  },
];

export const EmailSettingsConfiguration: WorkspaceFormConfiguration = {
  profileForm: emailForm,
  sections: emailSections,
};
