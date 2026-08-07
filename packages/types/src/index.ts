/**
 * The built-in roles, one per dashboard the design draws (Team Lead is the
 * design's name for `profileLead`). They are predefined permission sets, not
 * branches: nothing may test a role name to decide what someone *may do* —
 * check a permission instead. That is what lets an agency add a custom role
 * without a code change, and it is why permissions are **not** monotonic by
 * seniority (`submissions.approve` is client-only; the owner does not hold it).
 * Choosing which dashboard *variant* to render is presentation, not
 * authorization, and is the one place the role name is read (see the engine's
 * `attributes` ABAC and `packages/configurations/src/pages/dashboard.ts`).
 */
export type UserRole =
  | "owner"
  | "admin"
  | "accountManager"
  | "profileLead"
  | "recruiter"
  | "sourcer"
  | "hiringManager"
  | "client";

/** Role strings written by earlier builds, still present in live sessions.
 * `teamLead` is the design's name for what the permission model calls a
 * profile lead — the same seat, so it resolves to the same permissions. */
export const LEGACY_ROLES: Record<string, UserRole> = {
  lead: "profileLead",
  employee: "recruiter",
  teamLead: "profileLead",
};

/** Maps whatever a session carries onto a role this build knows. Unknown values
 * fall through to `recruiter`, the least-privileged internal seat. */
export function normaliseRole(role: string | null | undefined): UserRole {
  if (!role) return "recruiter";
  if (role in DEFAULT_ROLE_PERMISSIONS) return role as UserRole;
  return LEGACY_ROLES[role] ?? "recruiter";
}

export interface User {
  id: string;
  agencyId: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * What a role may do to a resource. CRUD plus the domain verbs the capability
 * matrix needs — `canAccess` does plain set-membership on these strings, so
 * adding a verb here is all it takes to author a new permission key.
 */
export type AccessAction =
  | "read"
  | "create"
  | "edit"
  | "update"
  | "delete"
  // domain verbs
  | "view"
  | "manage"
  | "invite"
  | "remove"
  | "use"
  | "publish"
  | "archive"
  | "merge"
  | "approve"
  | "submit"
  | "review"
  | "export"
  | "resetPassword"
  | "managePayment"
  | "manageApi"
  | "useExtension"
  | "managePrefixes";

/** A role's permissions: resource → allowed actions ("*" = every resource). */
export type RolePermissions = Record<string, AccessAction[]>;

/**
 * How far a granted action reaches. Orthogonal to the action itself: `edit`
 * says *may edit*, the scope says *edit whose records* — their own, their
 * desk's, or the whole workspace. Only record-bearing resources carry one;
 * workspace-wide resources (roles, billing, security…) are always `all`.
 */
export type RecordScope = "own" | "team" | "all";

/** A role's record scopes: resource → how far its grants reach. */
export type RoleScopes = Record<string, RecordScope>;

const ALL: AccessAction[] = ["read", "create", "edit", "update", "delete"];
const READ: AccessAction[] = ["read"];
const VIEW: AccessAction[] = ["read", "view"];
const MANAGE: AccessAction[] = ["read", "view", "manage"];

/**
 * Seed defaults for a new agency's role permissions, following the capability
 * matrix in `.claude/skills/roles-permissions/target-model.md`. The DB is the
 * runtime source of truth (per agency, editable in Settings); this map is only
 * the initial seed and the offline fallback. Indexed by role string (an agency
 * may hold custom roles, hence `Record<string, …>`).
 */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, RolePermissions> = {
  // Owns the subscription. Everything except the capabilities that are
  // structurally somebody else's — a client approves submissions, not the owner.
  owner: {
    "*": [...ALL, "export"],
    dashboard: READ,
    workspace: [...MANAGE, "managePrefixes"],
    reports: [...MANAGE, "export"],
    members: [...MANAGE, "invite", "remove", "resetPassword"],
    roles: [...MANAGE, "create"],
    jobs: [...ALL, "publish", "archive"],
    candidates: [...ALL, "merge", "export"],
    submissions: ["read", "view", "submit", "review"],
    clients: [...MANAGE, ...ALL, "export"],
    contacts: [...ALL, "export"],
    interviews: ALL,
    ai: [...MANAGE, "use"],
    templates: [...MANAGE, "use"],
    integrations: [...MANAGE, "manageApi", "useExtension"],
    billing: [...MANAGE, "managePayment"],
    security: MANAGE,
    audit: VIEW,
    revenue: [...VIEW, "export"],
    commissions: [...VIEW, "export"],
    settings: MANAGE,
  },
  // Runs the workspace. No ownership transfer, no payment details.
  admin: {
    dashboard: READ,
    workspace: MANAGE,
    reports: [...MANAGE, "export"],
    members: [...MANAGE, "invite", "remove", "resetPassword"],
    // Edits the matrix but cannot mint a role — creating one is the owner's.
    roles: MANAGE,
    jobs: [...ALL, "publish", "archive"],
    candidates: [...ALL, "merge", "export"],
    submissions: ["read", "view", "submit", "review"],
    clients: [...MANAGE, ...ALL, "export"],
    contacts: [...ALL, "export"],
    interviews: ALL,
    ai: [...VIEW, "use"],
    templates: [...MANAGE, "use"],
    integrations: [...MANAGE, "useExtension"],
    billing: VIEW,
    security: MANAGE,
    audit: VIEW,
    revenue: [...VIEW, "export"],
    commissions: [...VIEW, "export"],
    settings: MANAGE,
  },
  // Leads a desk: reviews what recruiters submit before it reaches a client.
  profileLead: {
    dashboard: READ,
    members: VIEW,
    jobs: [...ALL, "publish", "archive"],
    candidates: ["read", "create", "edit", "update", "export"],
    submissions: ["read", "view", "submit", "review"],
    clients: ["read", "view", "edit", "update"],
    contacts: ALL,
    interviews: ALL,
    ai: [...VIEW, "use"],
    templates: ["read", "use"],
    integrations: ["useExtension"],
    commissions: [...VIEW, "export"],
    settings: READ,
  },
  // Day-to-day recruiting and sourcing.
  recruiter: {
    dashboard: READ,
    jobs: ["read", "create", "edit"],
    candidates: ["read", "create", "edit"],
    submissions: ["read", "view", "submit"],
    clients: VIEW,
    contacts: ["read", "create", "edit"],
    interviews: ["read", "create"],
    ai: ["use"],
    templates: ["read", "use"],
    integrations: ["useExtension"],
  },
  // Owns a book of clients: renewals, fees and account health. No review gate,
  // no workspace administration.
  accountManager: {
    dashboard: READ,
    clients: [...MANAGE, ...ALL],
    contacts: ALL,
    jobs: ["read", "create", "edit"],
    candidates: ["read", "view"],
    submissions: ["read", "view"],
    interviews: ["read", "create"],
    revenue: [...VIEW, "export"],
    commissions: [...VIEW, "export"],
    reports: [...MANAGE, "export"],
    templates: ["read", "use"],
    settings: READ,
  },
  // Fills the top of the funnel. Adds candidates and works assigned searches;
  // does not submit to a client.
  sourcer: {
    dashboard: READ,
    jobs: READ,
    candidates: ["read", "create", "edit"],
    interviews: READ,
    ai: ["use"],
    templates: ["read", "use"],
    integrations: ["useExtension"],
  },
  // The internal quality gate. Reviews what recruiters produce before it
  // reaches a client — the same capability a profile lead holds, without the
  // desk-management ones.
  hiringManager: {
    dashboard: READ,
    jobs: READ,
    candidates: ["read", "view", "edit"],
    submissions: ["read", "view", "review"],
    interviews: ALL,
    ai: [...VIEW, "use"],
    templates: ["read", "use"],
    settings: READ,
  },
  // Client portal only. Approving a submission is theirs alone. Isolation from
  // other clients' data is a query scope in the service layer, not this map.
  client: {
    dashboard: READ,
    jobs: READ,
    candidates: READ,
    submissions: ["read", "view", "approve"],
    interviews: ["read", "create"],
  },
};

/**
 * Resources whose rows belong to somebody — the ones a record scope can narrow.
 * Everything else (roles, billing, security, the workspace itself) is a single
 * workspace-wide object, so scoping it would mean nothing.
 */
export const SCOPED_RESOURCES: string[] = [
  "jobs",
  "candidates",
  "submissions",
  "interviews",
  "clients",
  "contacts",
  "reports",
  "revenue",
  "commissions",
];

/** How far each built-in role's grants reach by default. */
const DEFAULT_SCOPE_BY_ROLE: Record<string, RecordScope> = {
  owner: "all",
  admin: "all",
  accountManager: "all",
  profileLead: "team",
  hiringManager: "team",
  recruiter: "own",
  sourcer: "own",
  client: "own",
};

/**
 * Seed scopes for a role: every scoped resource at the role's default reach,
 * everything else `all`. Custom roles the agency invents fall back to `own` —
 * the safe end.
 */
export function defaultScopesFor(role: string, resources: string[]): RoleScopes {
  const reach = DEFAULT_SCOPE_BY_ROLE[role] ?? "own";
  const scopes: RoleScopes = {};
  for (const resource of resources) {
    scopes[resource] = SCOPED_RESOURCES.includes(resource) ? reach : "all";
  }
  return scopes;
}

/** Roles that ship a bespoke dashboard. Anything else renders the generic,
 * permission-composed one. */
const DASHBOARD_VARIANTS_BY_NAME: Record<string, true> = {
  owner: true,
  admin: true,
  accountManager: true,
  profileLead: true,
  recruiter: true,
  sourcer: true,
  hiringManager: true,
  client: true,
};

const DASHBOARD_VARIANTS = new Set<string>([
  "owner",
  "admin",
  "accountManager",
  "profileLead",
  "recruiter",
  "sourcer",
  "hiringManager",
  "client",
]);

/**
 * Which dashboard variant a role renders. This is presentation, not
 * authorization — capabilities are still permission-checked. Keeping the
 * mapping here means a custom role an agency invents falls back cleanly rather
 * than matching no variant and rendering an empty page.
 */
export function dashboardVariantFor(role: string | null | undefined): string {
  if (!role) return "generic";
  // Deliberately not `normaliseRole`: that falls unknown roles back to
  // `recruiter` so they get least-privilege *permissions*, which is right. It
  // would be wrong here — a custom "Finance Manager" must not be handed a
  // recruiter's dashboard. Only a known role or a known alias gets a variant.
  const resolved = role in DASHBOARD_VARIANTS_BY_NAME ? role : LEGACY_ROLES[role];
  return resolved && DASHBOARD_VARIANTS.has(resolved) ? resolved : "generic";
}
