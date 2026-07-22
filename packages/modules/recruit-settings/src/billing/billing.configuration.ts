import type { JsonSchema, TableRendererConfig } from "@recruit/shared";

export interface ComparePlanRow {
  label: string;
  starter: string | boolean;
  growth: string | boolean;
  agency: string | boolean;
}

export interface BillingConfig {
  paymentForm: JsonSchema;
  history: TableRendererConfig;
  /** Order of the plan-feature tiles; ticked when the key is in `features`. */
  featureKeys: string[];
  usageTiles: { key: string; label: string; icon: string }[];
  comparison: ComparePlanRow[];
  plans: { key: string; label: string }[];
}

export const BillingConfiguration: BillingConfig = {
  paymentForm: {
    type: "object",
    properties: {
      paymentBrand: {
        type: "string",
        title: "paymentForm.brand",
        placeholder: "paymentForm.brandPlaceholder",
        icon: "credit-card",
      },
      paymentLast4: {
        type: "string",
        title: "paymentForm.last4",
        placeholder: "paymentForm.last4Placeholder",
      },
      paymentExpiry: {
        type: "string",
        title: "paymentForm.expiry",
        placeholder: "paymentForm.expiryPlaceholder",
      },
      billingEmail: {
        type: "string",
        format: "email",
        title: "paymentForm.email",
        placeholder: "paymentForm.emailPlaceholder",
        icon: "mail",
      },
      billingName: {
        type: "string",
        title: "paymentForm.name",
        placeholder: "paymentForm.namePlaceholder",
      },
      gstin: {
        type: "string",
        title: "paymentForm.gstin",
        placeholder: "paymentForm.gstinPlaceholder",
      },
      billingAddress: {
        type: "string",
        title: "paymentForm.address",
        placeholder: "paymentForm.addressPlaceholder",
      },
    },
    required: [],
  },

  history: {
    columns: [
      {
        label: { name: "history.invoice" },
        value: { type: "string", path: "number", sx: { fontWeight: 600 } },
      },
      {
        label: { name: "history.date" },
        value: { type: "string", path: "date", sx: { color: "text.secondary" } },
      },
      {
        label: { name: "history.plan" },
        value: { type: "string", path: "plan", sx: { color: "text.secondary" } },
      },
      {
        label: { name: "history.amount" },
        value: { type: "string", path: "amount", sx: { fontWeight: 600 } },
      },
      {
        label: { name: "history.status" },
        value: {
          type: "status",
          path: "status",
          variant: "soft",
          labels: {
            paid: "statuses.paid",
            pending: "statuses.pending",
            refunded: "statuses.refunded",
          },
          colors: { paid: "success", pending: "warning", refunded: "info" },
        },
      },
    ],
    emptyLabel: "history.empty",
    pagination: { pageSize: 6 },
  },

  featureKeys: [
    "aiMatching",
    "resumeParser",
    "browserExtension",
    "whiteLabel",
    "careerPages",
    "emailTemplates",
    "apiAccess",
    "sso",
  ],

  usageTiles: [
    { key: "resumeParsing", label: "usage.resumeParsing", icon: "description" },
    { key: "candidateMatches", label: "usage.candidateMatches", icon: "person-search" },
    { key: "emailsSent", label: "usage.emailsSent", icon: "mail" },
    { key: "storage", label: "usage.storage", icon: "folder" },
  ],

  comparison: [
    { label: "compare.recruiters", starter: "2", growth: "5", agency: "Unlimited" },
    { label: "compare.credits", starter: "500", growth: "5,000", agency: "Unlimited" },
    { label: "compare.whiteLabel", starter: false, growth: true, agency: true },
    { label: "compare.careerPages", starter: false, growth: true, agency: true },
    { label: "compare.apiAccess", starter: false, growth: false, agency: true },
    { label: "compare.sso", starter: false, growth: false, agency: true },
    { label: "compare.support", starter: "Email", growth: "Priority", agency: "Dedicated" },
  ],

  plans: [
    { key: "starter", label: "compare.starter" },
    { key: "growth", label: "compare.growth" },
    { key: "agency", label: "compare.agency" },
  ],
};
