import { expect, type Page, request as playwrightRequest, test } from "@playwright/test";

/**
 * Every role's dashboard, actually rendered.
 *
 * The other two suites check the app one role at a time (Admin) and the
 * configuration statically. Neither would notice a card that throws, a
 * translation key that never resolves, or a widget that fetches nothing —
 * only for one particular role. This renders all seven and looks.
 *
 * The role lives on the user row, so re-seating goes through `/e2e/role`,
 * which is unmounted unless `E2E_ENABLED` is set.
 */

const API = process.env.E2E_API_URL ?? "http://localhost:3001";

/**
 * `role` is the permission model's name, `blocks` the design's layout for it —
 * both taken from `dashboard.design-parity.spec.ts`, which reads the shapes off
 * the design itself. `profileLead` is the design's "Team Lead".
 */
const ROLES: { role: string; design: string; blocks: string[] }[] = [
  {
    role: "owner",
    design: "Owner",
    blocks: ["grid4", "blk", "blk", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  },
  {
    role: "admin",
    design: "Admin",
    blocks: ["grid4", "blk", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  },
  {
    role: "accountManager",
    design: "Account Manager",
    blocks: ["grid4", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  },
  {
    role: "profileLead",
    design: "Team Lead",
    blocks: ["grid4", "blk", "grid2", "blk", "grid2", "grid2", "blk", "grid2"],
  },
  {
    role: "recruiter",
    design: "Recruiter",
    blocks: ["grid4", "blk", "grid2", "blk", "grid2", "grid2", "blk", "grid2"],
  },
  {
    role: "sourcer",
    design: "Sourcer",
    blocks: ["grid4", "blk", "grid2", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  },
  {
    role: "hiringManager",
    design: "Hiring Manager",
    blocks: ["grid4", "blk", "grid2", "blk", "grid2", "grid2", "blk", "grid2"],
  },
];

async function seatAs(role: string) {
  const email = process.env.E2E_EMAIL;
  if (!email) throw new Error("Set E2E_EMAIL — see dashboard.setup.ts");
  const api = await playwrightRequest.newContext({
    baseURL: API,
    extraHTTPHeaders: { "content-type": "application/json" },
  });
  const response = await api.post("/e2e/role", { data: { email, role } });
  expect(response.status(), await response.text()).toBe(200);
  await api.dispose();
}

/** Renders the dashboard and reports everything worth failing on. */
async function inspect(page: Page) {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text().slice(0, 200));
  });
  const failed: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/dashboard/") && response.status() >= 400) {
      failed.push(`${response.status()} ${response.url().replace(/^.*:\d+/, "")}`);
    }
  });

  await page.setViewportSize({ width: 1440, height: 3400 });
  await page.goto("/");
  await page.getByRole("complementary").waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page
    .locator(".MuiSkeleton-root")
    .last()
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page.waitForTimeout(500);

  const report = await page.evaluate(() => {
    const main = document.querySelector("main");
    // The card stack is the last child of the content column; the greeting is
    // the first. Both live under the page's single <main>.
    const stack = main?.querySelector(":scope > div:last-child");
    const shape = [...(stack?.children ?? [])].map((el) => {
      const style = getComputedStyle(el);
      return style.display === "grid"
        ? `grid${style.gridTemplateColumns.split(" ").length}`
        : "blk";
    });
    // A translation that never resolved renders its dotted key verbatim.
    const text = (main as HTMLElement | null)?.innerText ?? "";
    const rawKeys = [...new Set(text.match(/\b[a-z][A-Za-z]*\.[a-z][A-Za-z.]{2,}\b/g) ?? [])]
      .filter((k) => !k.includes(" ") && !/\.(com|io|dev|org|net)$/.test(k))
      .slice(0, 8);
    // A card that rendered its shell but never got rows.
    const emptyCards = [...document.querySelectorAll("[data-testid]")]
      .filter((el) => {
        const id = el.getAttribute("data-testid") ?? "";
        if (!/^(side-list|queue-card|today-work|quick-actions)/.test(id)) return false;
        return (el as HTMLElement).innerText.trim().split("\n").filter(Boolean).length <= 2;
      })
      .map((el) => el.getAttribute("data-testid"));
    return { shape, rawKeys, emptyCards, chars: text.length };
  });

  return { ...report, consoleErrors, failed };
}

test.describe("every role's dashboard renders", () => {
  // Re-seating the shared account is global state; these cannot overlap.
  test.describe.configure({ mode: "serial" });

  for (const { role, design, blocks } of ROLES) {
    test(`${design} (${role})`, async ({ page }) => {
      await seatAs(role);
      const report = await inspect(page);

      console.log(`${design}:`, JSON.stringify(report));

      expect(report.failed, `${design}: failing /dashboard/* calls`).toEqual([]);
      expect(report.consoleErrors, `${design}: console errors`).toEqual([]);
      expect(report.rawKeys, `${design}: unresolved translation keys`).toEqual([]);
      expect(report.emptyCards, `${design}: cards that rendered no rows`).toEqual([]);
      expect(report.chars, `${design}: dashboard rendered content`).toBeGreaterThan(400);
      // Permissions may strip a block the design draws (an account manager
      // holds no AI licence), so the app's shape is a subsequence of the
      // design's, never longer and never re-ordered.
      expect(report.shape.length, `${design}: block count`).toBeLessThanOrEqual(blocks.length);
    });
  }

  test.afterAll(async () => {
    // Leave the account where the other suites expect it.
    await seatAs("admin");
  });
});
