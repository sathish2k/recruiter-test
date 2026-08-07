import type { RecordScope } from "@recruit/types";
import type { PermissionColumn, PermissionsConfig } from "./permissions.configuration";

/** One role as the API stores it. */
export interface RoleRecord {
  role: string;
  system: boolean;
  label: string | null;
  description: string | null;
  icon: string | null;
  permissions: { resource: string; actions: string[] }[];
  scope: Record<string, string>;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface RoleHolders {
  count: number;
  names: string[];
  members: { id: string; name: string; email: string }[];
}

/** The editable state of one role: which columns are ticked, and how far each row reaches. */
export interface RoleDraft {
  /** resource → column keys that are on. */
  grants: Record<string, string[]>;
  scope: Record<string, RecordScope>;
  /** Stored actions no column represents (`manage`, `publish`, …), kept so
   * saving the matrix never quietly drops a capability it doesn't render. */
  extras: Record<string, string[]>;
}

export type DraftState = Record<string, RoleDraft>;

const has = (list: string[], value: string) => list.includes(value);

/** Every resource the matrix renders, in row order. */
export function matrixResources(config: PermissionsConfig): string[] {
  return config.groups.flatMap((group) => group.rows.map((row) => row.resource));
}

/** Columns that come off when `key` does — the inverse of `requires`. */
export function dependantsOf(columns: PermissionColumn[], key: string): string[] {
  return columns.filter((column) => has(column.requires, key)).map((column) => column.key);
}

/** True when `key` is only on because something else needs it. */
export function isForced(columns: PermissionColumn[], granted: string[], key: string): boolean {
  return dependantsOf(columns, key).some((dependant) => has(granted, dependant));
}

function draftFor(record: RoleRecord, config: PermissionsConfig): RoleDraft {
  const claimed = new Set(config.columns.flatMap((column) => column.actions));
  const wildcard = record.permissions.find((entry) => entry.resource === "*");
  const draft: RoleDraft = { grants: {}, scope: {}, extras: {} };

  for (const resource of matrixResources(config)) {
    const entry = record.permissions.find((perm) => perm.resource === resource);
    const actions = entry?.actions ?? [];
    // A wildcard row holds every resource, so the matrix has to show it ticked
    // even where no explicit entry exists.
    const effective = wildcard ? [...new Set([...wildcard.actions, ...actions])] : actions;

    draft.grants[resource] = config.columns
      .filter((column) => column.actions.some((action) => has(effective, action)))
      .map((column) => column.key);
    draft.extras[resource] = actions.filter((action) => !claimed.has(action));
    draft.scope[resource] = (record.scope?.[resource] as RecordScope) ?? "all";
  }
  return draft;
}

export function buildDrafts(records: RoleRecord[], config: PermissionsConfig): DraftState {
  const state: DraftState = {};
  for (const record of records) state[record.role] = draftFor(record, config);
  return state;
}

export function cloneDraft(draft: RoleDraft): RoleDraft {
  return {
    grants: Object.fromEntries(Object.entries(draft.grants).map(([k, v]) => [k, [...v]])),
    scope: { ...draft.scope },
    extras: Object.fromEntries(Object.entries(draft.extras).map(([k, v]) => [k, [...v]])),
  };
}

export function cloneDrafts(state: DraftState): DraftState {
  return Object.fromEntries(Object.entries(state).map(([k, v]) => [k, cloneDraft(v)]));
}

/**
 * Ticking a box drags its prerequisites on; clearing one drags its dependants
 * off. Delete without edit, or edit without view, are states the store should
 * never hold — keeping them in step here means nothing downstream has to.
 */
export function applyToggle(
  granted: string[],
  columns: PermissionColumn[],
  key: string,
  on: boolean,
): string[] {
  const column = columns.find((entry) => entry.key === key);
  if (!column) return granted;
  const next = new Set(granted);
  if (on) {
    next.add(key);
    for (const need of column.requires) next.add(need);
  } else {
    next.delete(key);
    for (const dependant of dependantsOf(columns, key)) next.delete(dependant);
  }
  // Preserve column order so serialisation and diffs stay stable.
  return columns.filter((entry) => next.has(entry.key)).map((entry) => entry.key);
}

/** What one role's draft sends to `PUT /permissions/:role`. */
export function serialize(draft: RoleDraft, config: PermissionsConfig) {
  const permissions = matrixResources(config).map((resource) => {
    const granted = draft.grants[resource] ?? [];
    const actions = new Set<string>(draft.extras[resource] ?? []);
    for (const column of config.columns) {
      if (has(granted, column.key)) for (const action of column.actions) actions.add(action);
    }
    return { resource, actions: [...actions] };
  });
  return { permissions, scope: draft.scope };
}

export interface DraftChange {
  text: string;
  added: boolean;
}

/** Row-by-row difference between the saved role and the one on screen. */
export function diffDraft(
  base: RoleDraft,
  next: RoleDraft,
  config: PermissionsConfig,
  labels: {
    resource: (resource: string) => string;
    column: (key: string) => string;
    scope: (scope: RecordScope) => string;
  },
): DraftChange[] {
  const changes: DraftChange[] = [];
  for (const resource of matrixResources(config)) {
    for (const column of config.columns) {
      const was = has(base.grants[resource] ?? [], column.key);
      const now = has(next.grants[resource] ?? [], column.key);
      if (was !== now) {
        changes.push({
          added: now,
          text: `${labels.column(column.key)} · ${labels.resource(resource)}`,
        });
      }
    }
    const wasScope = base.scope[resource];
    const nowScope = next.scope[resource];
    if (wasScope !== nowScope && nowScope) {
      changes.push({
        added: true,
        text: `${labels.resource(resource)}: ${labels.scope(wasScope ?? "all")} → ${labels.scope(nowScope)}`,
      });
    }
  }
  return changes;
}

/** The four figures on the summary card. */
export function summarise(draft: RoleDraft, config: PermissionsConfig) {
  const resources = matrixResources(config);
  const reachable = resources.filter((resource) => (draft.grants[resource] ?? []).length > 0);
  const restricted = resources.filter((resource) => (draft.grants[resource] ?? []).length === 0);
  const enabled = resources.reduce(
    (total, resource) => total + (draft.grants[resource] ?? []).length,
    0,
  );
  const destructive = resources.filter((resource) => has(draft.grants[resource] ?? [], "delete"));
  return {
    resources,
    reachable,
    restricted,
    enabled,
    destructive,
    total: resources.length * config.columns.length,
  };
}
