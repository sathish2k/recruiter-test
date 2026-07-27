import type {
  ActionItem,
  EntityRendererConfig,
  StatCardRendererConfig,
  StatusRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

/** A key/value row in one of the detail cards. `translate` renders the value as
 * `t("<translate>.<value>")` so stored enum ids show their label. */
export interface DetailFieldConfig {
  key: string;
  /** Translation key for the row label. */
  label: string;
  /** Path on the record (dot-notation supported). */
  path: string;
  translate?: string;
  /** Render as a link — `mailto:` for email, `tel:` for phone, else the value. */
  as?: "text" | "link" | "email" | "phone";
}

/** The identity row: avatar/name/subtitle plus the two state chips. */
export interface DetailHeaderConfig {
  entity: EntityRendererConfig;
  status: StatusRendererConfig;
  health: StatusRendererConfig;
}

export interface ClientDetailConfiguration {
  header: DetailHeaderConfig;
  stats: StatCardRendererConfig[];
  about: DetailFieldConfig[];
  agreement: DetailFieldConfig[];
  roles: TableRendererConfig;
  contacts: TableRendererConfig;
  primaryAction: ActionItem;
  menuActions: ActionItem[];
  listRouteId: string;
  editRouteId: string;
  contactRouteId: string;
  jobRouteId: string;
}

export const ClientDetailConfiguration: ClientDetailConfiguration = {
  header: {
    // `hashPath` picks a stable tile colour from the name — no literal hexes.
    entity: {
      type: "entity",
      shape: "square",
      size: 56,
      hashPath: "name",
      title: "name",
      subtitle: "subtitleLine",
    },
    status: {
      type: "status",
      path: "status",
      labels: { hiring: "Hiring", paused: "Paused" },
      colors: { hiring: "success", paused: "default" },
    },
    health: {
      type: "status",
      path: "health",
      dot: true,
      variant: "outlined",
      labels: {
        healthy: "Healthy",
        attention: "Needs attention",
        at_risk: "At risk",
        dormant: "Dormant",
      },
      colors: {
        healthy: "success",
        attention: "warning",
        at_risk: "error",
        dormant: "default",
      },
    },
  },
  // Revenue is deliberately absent — there is no invoice table yet, and a
  // placeholder number on an account screen is worse than no number.
  stats: [
    { label: { name: "metrics.openRoles" }, value: { type: "number", path: "openRoles" } },
    { label: { name: "metrics.candidates" }, value: { type: "number", path: "candidates" } },
    { label: { name: "metrics.placements" }, value: { type: "number", path: "placements" } },
  ],
  about: [
    { key: "industry", label: "labels.industry", path: "industry" },
    { key: "website", label: "labels.website", path: "website", as: "link" },
    { key: "phone", label: "labels.phone", path: "phone", as: "phone" },
    { key: "accountLead", label: "labels.accountLead", path: "accountLeadName" },
    { key: "source", label: "labels.source", path: "source", translate: "source" },
    { key: "address", label: "labels.address", path: "addressLine" },
  ],
  agreement: [
    { key: "feeBasis", label: "labels.feeBasis", path: "feeBasis", translate: "feeBasis" },
    { key: "feeValue", label: "labels.feeValue", path: "feeValue" },
    {
      key: "paymentTerms",
      label: "labels.paymentTerms",
      path: "paymentTerms",
      translate: "paymentTermsOptions",
    },
    { key: "billingEmail", label: "labels.billingEmail", path: "billingEmail", as: "email" },
    { key: "taxId", label: "labels.taxId", path: "taxId" },
  ],
  roles: {
    columns: [
      {
        label: { name: "roles.columns.title" },
        value: { type: "entity", shape: "square", title: "title", subtitle: "industry" },
      },
      { label: { name: "roles.columns.openings" }, value: { type: "string", path: "openings" } },
      {
        label: { name: "roles.columns.profileLead" },
        value: {
          type: "entity",
          shape: "circle",
          hashPath: "profileLeadName",
          title: "profileLeadName",
        },
      },
      { label: { name: "roles.columns.pipeline" }, value: { type: "string", path: "candidates" } },
      {
        label: { name: "roles.columns.status" },
        value: {
          type: "status",
          path: "status",
          labels: {
            open: "Open",
            on_hold: "On hold",
            filled: "Filled",
            closed: "Closed",
          },
        },
      },
    ],
    rowRouteId: "Recruit.JobEdit.Route",
    emptyLabel: "roles.empty",
  },
  contacts: {
    columns: [
      {
        label: { name: "contacts.columns.name" },
        value: { type: "entity", shape: "circle", title: "name", subtitle: "title" },
      },
      { label: { name: "contacts.columns.email" }, value: { type: "string", path: "email" } },
    ],
    rowRouteId: "Recruit.ContactEdit.Route",
    emptyLabel: "contacts.empty",
  },
  primaryAction: {
    type: "addRole",
    icon: "add",
    label: { name: "actions.addRole" },
    routeId: "Recruit.JobNew.Route",
  },
  menuActions: [
    {
      type: "edit",
      icon: "edit",
      label: { name: "actions.edit" },
      routeId: "Recruit.ClientEdit.Route",
      params: { id: { type: "dynamic", path: "id" } },
    },
    {
      type: "addContact",
      icon: "person-add",
      label: { name: "actions.addContact" },
      routeId: "Recruit.ContactNew.Route",
    },
    {
      type: "viewJobs",
      icon: "work",
      label: { name: "actions.viewJobs" },
      routeId: "Recruit.Jobs.Route",
      queryParams: { clientId: { type: "dynamic", path: "id" } },
    },
  ],
  listRouteId: "Recruit.Clients.Route",
  editRouteId: "Recruit.ClientEdit.Route",
  contactRouteId: "Recruit.ContactNew.Route",
  jobRouteId: "Recruit.JobNew.Route",
};
