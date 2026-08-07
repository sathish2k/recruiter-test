import { describe, expect, test } from "bun:test";
import { filterConfigAccess } from "@recruit/sdk";
import { DEFAULT_ROLE_PERMISSIONS, dashboardVariantFor } from "@recruit/types";
import { SidenavConfiguration } from "../../modules/recruit-core/src/sidenav/sidenav.configuration";

/**
 * The rail each role sees, taken from the design's `ROLES[role].nav` mapped
 * through its `NAV` groups. The design authors this per role rather than
 * deriving it from capabilities, so this table is the spec — permissions alone
 * do not reproduce it (an admin holds `jobs` but sees no RECRUITING group).
 *
 * `client` has no design counterpart; it inherits the review-desk shape.
 */
const EXPECTED: Record<string, string[]> = {
  owner: [
    "MAIN[Dashboard]",
    "RECRUITING[Jobs, Candidates, Pipeline]",
    "CRM[Clients, Contacts]",
    "ADMINISTRATION[User Management, Roles & permissions, Settings]",
  ],
  admin: [
    "MAIN[Dashboard]",
    "CRM[Clients, Contacts]",
    "ADMINISTRATION[User Management, Roles & permissions, Settings]",
  ],
  accountManager: [
    "MAIN[Dashboard]",
    "RECRUITING[Jobs, Candidates, Pipeline]",
    "CRM[Clients, Contacts]",
  ],
  profileLead: [
    "MAIN[Dashboard]",
    "RECRUITING[Jobs, Candidates, Pipeline]",
    "CRM[Clients, Contacts]",
  ],
  recruiter: ["MAIN[Dashboard]", "RECRUITING[Jobs, Candidates, Pipeline]"],
  sourcer: ["MAIN[Dashboard]", "RECRUITING[Jobs, Candidates, Pipeline]"],
  hiringManager: ["MAIN[Dashboard]", "RECRUITING[Jobs, Candidates]"],
  client: ["MAIN[Dashboard]", "RECRUITING[Jobs, Candidates]"],
};

// The translation keys carry no meaning for the assertion; the leaf name does.
const leaf = (key: string) => key.split(".").pop() ?? key;

function railFor(role: string, permissions = DEFAULT_ROLE_PERMISSIONS[role] ?? {}): string[] {
  const context = {
    permissions,
    attributes: { dashboardVariant: dashboardVariantFor(role) },
  };
  const filtered = filterConfigAccess(SidenavConfiguration, context);
  return (filtered?.groups ?? [])
    .filter((group) => group.items.length > 0)
    .map((group) => `${leaf(group.title)}[${group.items.map((i) => leaf(i.label)).join(", ")}]`);
}

describe("sidenav", () => {
  test("every built-in role has a rail", () => {
    expect(Object.keys(EXPECTED).sort()).toEqual(Object.keys(DEFAULT_ROLE_PERMISSIONS).sort());
  });

  for (const role of Object.keys(EXPECTED)) {
    test(`${role} sees the design's groups`, () => {
      // Compare against the design's shape, not the translated labels.
      const shape = EXPECTED[role].map((row) =>
        row
          .replace(/^MAIN/, "main")
          .replace(/^RECRUITING/, "recruiting")
          .replace(/^CRM/, "crm")
          .replace(/^ADMINISTRATION/, "administration")
          .replace(/Dashboard/, "dashboard")
          .replace(/Jobs/, "jobs")
          .replace(/Candidates/, "candidates")
          .replace(/Pipeline/, "pipeline")
          .replace(/Interviews/, "interviews")
          .replace(/Offers/, "offers")
          .replace(/Placements/, "placements")
          .replace(/Clients/, "clients")
          .replace(/Contacts/, "contacts")
          .replace(/User Management/, "userManagement")
          .replace(/Roles & permissions/, "rolesPermissions")
          .replace(/Settings/, "settings"),
      );
      expect(railFor(role)).toEqual(shape);
    });
  }

  // An agency's own role resolves to the "generic" variant, so it must land in
  // the broad groups rather than dropping to a bare MAIN.
  test("a custom role gets the full desk, scoped by what it was granted", () => {
    const rail = railFor("financeManager", DEFAULT_ROLE_PERMISSIONS.accountManager);
    expect(rail).toEqual([
      "main[dashboard]",
      "recruiting[jobs, candidates, pipeline]",
      "crm[clients, contacts]",
    ]);
  });
});
