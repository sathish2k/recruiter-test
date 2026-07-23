import type { FormLayoutProps, FormSection, JsonSchema } from "@recruit/shared";

export interface ClientFormConfiguration {
  schema: JsonSchema;
  sections: FormSection[];
  sectionsContainer: FormLayoutProps;
  listRouteId: string;
}

export const ClientFormConfiguration: ClientFormConfiguration = {
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        title: "fields.name",
        placeholder: "fields.namePlaceholder",
        maxLength: 150,
        errorMessage: { maxLength: "fields.nameMax" },
        grid: { size: { xs: 12, md: 6 } },
      },
      parentCompany: {
        type: "string",
        widget: "select",
        title: "fields.parentCompany",
        placeholder: "fields.parentCompanyPlaceholder",
        optionSource: { url: "/clients", path: "data", valueKey: "name", labelKey: "name" },
        maxLength: 150,
        grid: { size: { xs: 12, md: 6 } },
      },
      phone: {
        type: "string",
        widget: "phone",
        title: "fields.phone",
        placeholder: "fields.phonePlaceholder",
        optionSource: { url: "/reference", path: "data.dialCodes" },
        errorMessage: { phone: "fields.phoneInvalid" },
        grid: { size: { xs: 12, md: 6 } },
      },
      website: {
        type: "string",
        title: "fields.website",
        placeholder: "fields.websitePlaceholder",
        maxLength: 255,
        grid: { size: { xs: 12, md: 6 } },
      },
      industry: {
        type: "string",
        widget: "select",
        searchable: true,
        title: "fields.industry",
        placeholder: "fields.industryPlaceholder",
        optionSource: { url: "/industries", path: "data", valueKey: "name", labelKey: "name" },
        grid: { size: { xs: 12, md: 6 } },
      },
      primaryContactId: {
        type: "string",
        widget: "select",
        avatar: true,
        title: "fields.primaryContact",
        placeholder: "fields.primaryContactPlaceholder",
        optionSource: { url: "/contacts", path: "data", valueKey: "id", labelKey: "name" },
        grid: { size: { xs: 12, md: 6 } },
      },
      notes: {
        type: "string",
        widget: "textarea",
        rows: 4,
        title: "fields.notes",
        placeholder: "fields.notesPlaceholder",
        maxLength: 5000,
        errorMessage: { maxLength: "fields.notesMax" },
        grid: { size: { xs: 12 } },
      },
      address: {
        type: "object",
        widget: "address",
        title: "sections.address",
        grid: { size: { xs: 12 } },
      },
      contract: {
        type: "array",
        widget: "attachments",
        title: "fields.contract",
        uploadLabel: "fields.attachmentsBrowse",
        accept: "application/pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png",
        maxSizeMb: 20,
        grid: { size: { xs: 12, md: 6 } },
      },
      attachments: {
        type: "array",
        widget: "attachments",
        title: "fields.others",
        uploadLabel: "fields.attachmentsBrowse",
        accept: "application/pdf,.doc,.docx,.xls,.xlsx,image/jpeg,image/png",
        maxSizeMb: 20,
        grid: { size: { xs: 12, md: 6 } },
      },
      accountLeadId: {
        type: "string",
        widget: "select",
        avatar: true,
        title: "fields.accountLead",
        placeholder: "fields.accountLeadPlaceholder",
        optionSource: { url: "/users", path: "data", valueKey: "id", labelKey: "name" },
        grid: { size: { xs: 12 } },
      },
      source: {
        type: "string",
        widget: "select",
        title: "fields.source",
        enum: ["added_by_user", "referral", "inbound", "outbound", "event"],
        grid: { size: { xs: 12 } },
      },
      feeBasis: {
        type: "string",
        widget: "segmented",
        title: "fields.feeBasis",
        enum: ["percent", "flat"],
        default: "percent",
        grid: { size: { xs: 12 } },
      },
      feeValue: {
        type: "string",
        widget: "feeValue",
        title: "fields.feeValue",
        placeholder: "fields.feeValuePlaceholder",
        maxLength: 40,
        grid: { size: { xs: 12 } },
      },
      paymentTerms: {
        type: "string",
        widget: "select",
        title: "fields.paymentTerms",
        placeholder: "fields.paymentTermsPlaceholder",
        enum: ["net15", "net30", "net45", "net60"],
        default: "net30",
        grid: { size: { xs: 12 } },
      },
      billingEmail: {
        type: "string",
        format: "email",
        title: "fields.billingEmail",
        placeholder: "fields.billingEmailPlaceholder",
        maxLength: 255,
        errorMessage: { format: "fields.emailInvalid", maxLength: "fields.emailMax" },
        grid: { size: { xs: 12, md: 6 } },
      },
      taxId: {
        type: "string",
        title: "fields.taxId",
        placeholder: "fields.taxIdPlaceholder",
        maxLength: 40,
        grid: { size: { xs: 12, md: 6 } },
      },
      feeInfo: {
        type: "string",
        widget: "callout",
        variant: "banner",
        icon: "info",
        help: "fields.feeInfo",
        grid: { size: { xs: 12 } },
      },
    },
    required: ["name"],
    errorMessage: { required: { name: "fields.nameRequired" } },
  },
  // Main content (md:8) — Client information, Address, Attachments — beside the
  // side column (md:4) — Ownership + Fee agreement. Stacks on mobile.
  sections: [
    {
      grid: { size: { xs: 12, md: 8 } },
      sections: [
        {
          title: "sections.info",
          gridContainer: { columns: 12, spacing: 2 },
          fields: [
            "name",
            "parentCompany",
            "phone",
            "website",
            "industry",
            "primaryContactId",
            "notes",
          ],
        },
        {
          bare: true,
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["address"],
        },
        {
          title: "sections.attachments",
          description: "sections.attachmentsHint",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["contract", "attachments"],
        },
      ],
    },
    {
      grid: { size: { xs: 12, md: 4 } },
      sections: [
        {
          title: "sections.ownership",
          description: "sections.ownershipHint",
          gridContainer: { columns: 12, spacing: 2 },
          fields: ["accountLeadId", "source"],
        },
        {
          title: "sections.fee",
          description: "sections.feeHint",
          accent: true,
          icon: "request-quote",
          gridContainer: { columns: 12, spacing: 1.5 },
          fields: ["feeBasis", "feeValue", "paymentTerms", "billingEmail", "taxId", "feeInfo"],
        },
      ],
    },
  ],
  sectionsContainer: { gridContainer: { columns: 12, spacing: 2 } },
  listRouteId: "Recruit.Clients.Route",
};
