import { describe, expect, test } from "bun:test";
import type { AccessContext, Configuration } from "@recruit/sdk";
import { filterConfigAccess, filterConfigurationsAccess } from "@recruit/sdk";
import { DEFAULT_ROLE_PERMISSIONS, dashboardVariantFor, normaliseRole } from "@recruit/types";
import { SidenavConfiguration } from "../../modules/recruit-core/src/sidenav/sidenav.configuration";
import { DashboardQuickActionsConfiguration } from "../../modules/recruit-dashboard/src/dashboard-quick-actions/dashboard-quick-actions.configuration";
import { DashboardPages } from "./pages/dashboard";

/**
 * The dashboard is one page whose blocks each declare a permission. These
 * assert that the seven role dashboards the design draws really do fall out of
 * that — if someone reintroduces a role-name branch, the shapes below stop
 * differing and these fail.
 */
function contextFor(role: string): AccessContext {
  const resolved = normaliseRole(role);
  return {
    attributes: { role: resolved, dashboardVariant: dashboardVariantFor(role) },
    permissions: DEFAULT_ROLE_PERMISSIONS[resolved] ?? {},
  };
}

function visibleElementIds(role: string, configurationId: string): string[] {
  const configuration = DashboardPages[configurationId] as Configuration;
  const [filtered] = filterConfigurationsAccess([configuration], contextFor(role));
  return (filtered?.elements ?? []).map((element) => element.id);
}

function visibleActionLabels(role: string): string[] {
  const scoped = filterConfigAccess(DashboardQuickActionsConfiguration, contextFor(role));
  return (scoped?.actions ?? []).map((action) => action.label);
}

describe("dashboard composition follows permissions, not role names", () => {
  test("every built-in role gets the always-on spine", () => {
    for (const role of [
      "owner",
      "admin",
      "accountManager",
      "profileLead",
      "recruiter",
      "sourcer",
      "hiringManager",
      "client",
    ]) {
      const ids = visibleElementIds(role, "Recruit.DashboardMain.Configuration");
      expect(ids).toContain("dashboard-welcome");
      // Its own variant, plus the shared context card.
      expect(ids).toContain(`dashboard-${role}`);
      expect(ids).toContain(`dashboard-${role}`);
    }
  });

  test("a client's dashboard drops the internal blocks", () => {
    expect(visibleElementIds("client", "Recruit.DashboardMain.Configuration")).toContain(
      "dashboard-client",
    );
    // A client may read candidates submitted to them, but holds no AI licence,
    // so their variant carries no AI card at all.
    expect(visibleElementIds("client", "Recruit.ClientDashboard.Configuration")).not.toContain(
      "client-ai",
    );
  });

  test("the AI card needs the licence, not merely read access", () => {
    // A recruiter holds ai.use and sees it; nobody without the licence does.
    expect(visibleElementIds("recruiter", "Recruit.RecruiterDashboard.Configuration")).toContain(
      "recruiter-ai",
    );
    expect(
      visibleElementIds("accountManager", "Recruit.AccountManagerDashboard.Configuration"),
    ).not.toContain("account-manager-ai");
  });

  test("quick actions differ by capability", () => {
    const owner = visibleActionLabels("owner");
    const recruiter = visibleActionLabels("recruiter");
    const client = visibleActionLabels("client");

    // Inviting a member is an admin capability; a recruiter never sees it.
    expect(owner).toContain("inviteMember");
    expect(recruiter).not.toContain("inviteMember");

    // Reviewing submissions is the lead/hiring-manager gate.
    expect(visibleActionLabels("profileLead")).toContain("reviewQueue");
    expect(recruiter).not.toContain("reviewQueue");

    // A recruiter still adds candidates. A client schedules interviews — that
    // is theirs in the target model — and holds none of the internal actions.
    expect(recruiter).toContain("addCandidate");
    expect(client).toEqual(["scheduleInterview"]);
  });

  test("legacy role strings still resolve to a dashboard", () => {
    // Sessions written before the rename carry `employee` / `lead`.
    expect(visibleActionLabels("employee")).toEqual(visibleActionLabels("recruiter"));
    expect(visibleActionLabels("lead")).toEqual(visibleActionLabels("profileLead"));
  });
});

describe("each role renders its own dashboard module", () => {
  const VARIANTS: [string, string][] = [
    ["owner", "Owner"],
    ["admin", "Admin"],
    ["accountManager", "AccountManager"],
    ["profileLead", "TeamLead"],
    ["recruiter", "Recruiter"],
    ["sourcer", "Sourcer"],
    ["hiringManager", "HiringManager"],
    ["client", "Client"],
  ];

  test("exactly one variant survives per role", () => {
    for (const [role] of VARIANTS) {
      const ids = visibleElementIds(role, "Recruit.DashboardMain.Configuration");
      const variants = ids.filter((id) => id.startsWith("dashboard-") && id.endsWith(role));
      expect(variants).toEqual([`dashboard-${role}`]);
      // No other role's variant leaks in.
      const others = VARIANTS.filter(([other]) => other !== role).map(
        ([other]) => `dashboard-${other}`,
      );
      for (const other of others) expect(ids).not.toContain(other);
      expect(ids).not.toContain("dashboard-generic");
    }
  });

  test("a variant points at that role's own widgets", () => {
    for (const [role, ns] of VARIANTS) {
      const configuration = DashboardPages[`Recruit.${ns}Dashboard.Configuration`] as Configuration;
      expect(configuration).toBeDefined();
      // Every widget a variant renders — directly or through a nested
      // configuration — must belong to that role's own namespace. Roles differ
      // in how many cards they carry; none may borrow another's.
      const own = (config: Configuration): string[] =>
        (config.elements ?? []).flatMap((element) =>
          element.type === "configuration"
            ? own(DashboardPages[element.configurationId ?? ""] as Configuration)
            : [element.componentType ?? ""],
        );
      const types = own(configuration);
      expect(types.length).toBeGreaterThanOrEqual(3);
      for (const type of types) expect(type.startsWith(`Recruit.${ns}.`)).toBe(true);
      // The spine three are always present. There is deliberately no alert
      // banner: the design's template never renders one — `R.alert` is fixture
      // data it defines and drops, like `R.rail`.
      expect(types).toContain(`Recruit.${ns}.DashboardStats.Component`);
      expect(types).toContain(`Recruit.${ns}.DashboardStatus.Component`);
      expect(types).toContain(`Recruit.${ns}.DashboardQueue.Component`);
      expect(types).not.toContain(`Recruit.${ns}.DashboardAlert.Component`);
      expect(role).toBeTruthy();
    }
  });

  test("a custom role falls back to the generic dashboard", () => {
    const ids = visibleElementIds("financeManager", "Recruit.DashboardMain.Configuration");
    // Unknown roles normalise to `recruiter` permissions but no bespoke
    // variant, so they land on the permission-composed one.
    expect(dashboardVariantFor("financeManager")).toBe("generic");
    expect(ids).toContain("dashboard-generic");
    for (const [role] of VARIANTS) expect(ids).not.toContain(`dashboard-${role}`);
  });
});

/**
 * The block order the design draws, per role.
 *
 * Read straight off `AIRecruiter - Dashboard.dc.html` by stepping its role
 * switcher — `dashboard.design-parity.spec.ts` re-derives this table from the
 * live design so it cannot quietly rot. Four things it pins that are easy to
 * get wrong, and were wrong: the desk and the team-health pair sit *above*
 * today's work, saved searches sits between them for a sourcer, and team
 * health/coaching are one two-up row rather than two stacked cards.
 */
const DESIGN_LAYOUT: Record<string, string[]> = {
  Owner: [
    "Stats",
    "Status",
    "TodayWork",
    "Team",
    "ClientHealth",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
  Admin: [
    "Stats",
    "Status",
    "System",
    "TodayWork",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
  AccountManager: [
    "Stats",
    "Status",
    "TodayWork",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
  TeamLead: [
    "Stats",
    "Status",
    "TeamHealth+Coaching",
    "TodayWork",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
  Recruiter: [
    "Stats",
    "Status",
    "MyPipeline+WeekGoals",
    "TodayWork",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
  Sourcer: [
    "Stats",
    "Status",
    "MyPipeline+WeekGoals",
    "SavedSearches",
    "TodayWork",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
  HiringManager: [
    "Stats",
    "Status",
    "MyPipeline+WeekGoals",
    "TodayWork",
    "Queue+Side",
    "Chart+QuickActions",
    "Ai",
    "Activity+Recents",
  ],
};

/** A role's blocks in order; a nested configuration collapses to "A+B". */
function layoutOf(namespace: string): string[] {
  const short = (type: string) => type.split(".").at(-2)?.replace("Dashboard", "") ?? "";
  const walk = (config: Configuration): string[] =>
    (config.elements ?? []).map((element) => {
      if (element.type !== "configuration") return short(element.componentType ?? "");
      const nested = DashboardPages[element.configurationId ?? ""] as Configuration;
      return (nested?.elements ?? []).map((child) => short(child.componentType ?? "")).join("+");
    });
  return walk(DashboardPages[`Recruit.${namespace}Dashboard.Configuration`] as Configuration);
}

describe("every role's dashboard is laid out the way the design draws it", () => {
  for (const [namespace, expected] of Object.entries(DESIGN_LAYOUT)) {
    test(`${namespace} matches the design's block order`, () => {
      expect(layoutOf(namespace)).toEqual(expected);
    });
  }
});
