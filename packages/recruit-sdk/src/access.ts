import type {
  AccessAction,
  AccessContext,
  AccessRule,
  Configuration,
  Route,
} from "./types";

const DEFAULT_ACTIONS: AccessAction[] = ["read"];

export function canAccess(
  context: AccessContext | null | undefined,
  rule?: AccessRule,
): boolean {
  if (!rule) return true;
  if (!context) return false;
  const actions = rule.action?.length ? rule.action : DEFAULT_ACTIONS;
  const allowed = new Set<AccessAction>([
    ...(context.permissions[rule.resource] ?? []),
    ...(context.permissions["*"] ?? []),
  ]);
  if (!actions.every((action) => allowed.has(action))) return false;
  if (rule.attributes) {
    for (const [key, values] of Object.entries(rule.attributes)) {
      if (!values.includes(context.attributes[key])) return false;
    }
  }
  return true;
}

/** Route-branch check: every matched route's access rule must pass. */
export function canAccessRoutes(
  context: AccessContext | null | undefined,
  routes: Route[] | null,
): boolean {
  if (!routes) return true;
  return routes.every((route) => canAccess(context, route.access));
}

/** Strips elements the user cannot access (and the access metadata itself)
 * from every configuration before rendering. */
export function filterConfigurationsAccess(
  configurations: Configuration[],
  context: AccessContext | null | undefined,
): Configuration[] {
  return configurations.map((configuration) => ({
    ...configuration,
    elements: configuration.elements
      .filter((element) => canAccess(context, element.access))
      .map(({ access: _access, ...element }) => element),
  }));
}

function isAccessRule(value: unknown): value is AccessRule {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as AccessRule).resource === "string"
  );
}

/** Deep-filters a component configuration: any object carrying an `access`
 * rule the user fails is removed (array item or object field), and verified
 * rules are stripped, so components receive a config already scoped to the
 * user — no access checks needed in component code. */
export function filterConfigAccess<T>(
  value: T,
  context: AccessContext | null | undefined,
): T | undefined {
  if (Array.isArray(value)) {
    return value
      .map((item) => filterConfigAccess(item, context))
      .filter((item) => item !== undefined) as unknown as T;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (isAccessRule(record.access) && !canAccess(context, record.access)) {
      return undefined;
    }
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(record)) {
      if (key === "access" && isAccessRule(entry)) continue;
      const filtered = filterConfigAccess(entry, context);
      if (filtered !== undefined) out[key] = filtered;
    }
    return out as T;
  }
  return value;
}
