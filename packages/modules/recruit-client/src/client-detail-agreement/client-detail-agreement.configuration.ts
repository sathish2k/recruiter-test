/** A key/value row in the agreement card. `translate` renders the value as
 * `t("<translate>.<value>")` so a stored enum id shows its label. */
export interface DetailFieldConfig {
  key: string;
  label: string;
  path: string;
  translate?: string;
  as?: "text" | "link" | "email" | "phone";
}

export interface ClientDetailAgreementConfiguration {
  title: { name: string };
  fields: DetailFieldConfig[];
}

export const ClientDetailAgreementConfiguration: ClientDetailAgreementConfiguration = {
  title: { name: "sections.agreement" },
  fields: [
    { key: "feeBasis", label: "labels.feeModel", path: "feeSummary" },
    { key: "replacement", label: "labels.replacement", path: "replacementLabel" },
    {
      key: "paymentTerms",
      label: "labels.paymentTerms",
      path: "paymentTerms",
      translate: "paymentTermsOptions",
    },
    { key: "billingEmail", label: "labels.billingEmail", path: "billingEmail", as: "email" },
    { key: "taxId", label: "labels.taxId", path: "taxId" },
    { key: "renews", label: "labels.renews", path: "renewsLabel" },
  ],
};
