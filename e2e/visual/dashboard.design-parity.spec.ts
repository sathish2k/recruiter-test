import { expect, type Page, test } from "@playwright/test";

/**
 * Does the dashboard match the design?
 *
 * `dashboard.visual.spec.ts` pins the app to its own previous screenshot, which
 * catches drift but can never answer that question — the baseline is the app.
 * This suite renders `AIRecruiter - Dashboard.dc.html` itself and reads the
 * chrome straight out of it, so the expected values are the design's, not ours.
 *
 * It compares *chrome*, not pixels. The design ships fixture data for a
 * seven-role demo and its own shell, so a pixel diff of the two pages would
 * never be zero and would tell us nothing. Card tint, radius, shadow, grid
 * tracks and the type scale are what a regression actually breaks, and they are
 * identical regardless of whose numbers sit in the card.
 *
 * Both sides are located the same way — by shape, not by selector — so the
 * test is coupled to neither the design's markup nor ours. If the KPI row stops
 * being "a four-track grid of cards", that is itself the regression.
 */

const DESIGN = process.env.E2E_DESIGN_URL ?? "http://localhost:3020";

/** Finds the KPI row by shape and reads the chrome the design specifies. */
function readKpiChrome(page: Page) {
  return page.evaluate(() => {
    const pick = (el: Element | null | undefined, props: string[]) => {
      const out: Record<string, string> = {};
      if (!el) return out;
      const style = getComputedStyle(el);
      for (const prop of props) out[prop] = String(style[prop as keyof CSSStyleDeclaration]);
      return out;
    };

    // The KPI row is the first four-track grid on the page whose children are
    // all cards — every dashboard in the design opens on one.
    const row = [...document.querySelectorAll<HTMLElement>("div")].find((el) => {
      const style = getComputedStyle(el);
      if (style.display !== "grid") return false;
      const tracks = style.gridTemplateColumns.split(" ").filter(Boolean);
      return tracks.length === 4 && el.children.length === 4;
    });
    // A grid cell is not always the card: the engine wraps each tile in a
    // positioning Box, so descend to the first painted surface inside it.
    const cardIn = (cell: Element): Element => {
      if (getComputedStyle(cell).borderRadius !== "0px") return cell;
      const painted = [...cell.querySelectorAll<HTMLElement>("*")].find(
        (el) => getComputedStyle(el).borderRadius !== "0px" && el.clientHeight > 40,
      );
      return painted ?? cell;
    };
    const cards = row ? [...row.children].map(cardIn) : [];
    const first = cards[0];

    // The glyph tile: 32×32 with an 8px radius, per the design.
    const tile = first
      ? [...first.querySelectorAll<HTMLElement>("*")].find((el) => {
          const style = getComputedStyle(el);
          return style.width === "32px" && style.height === "32px" && style.borderRadius === "8px";
        })
      : undefined;

    // The big figure is the only thing on the card set in the display face.
    const value = first
      ? [...first.querySelectorAll<HTMLElement>("*")].find((el) =>
          getComputedStyle(el).fontFamily.includes("Space Grotesk"),
        )
      : undefined;

    return {
      found: Boolean(row),
      gridTemplateColumns: row ? getComputedStyle(row).gridTemplateColumns : "",
      gap: row ? getComputedStyle(row).gap : "",
      card: pick(first, ["backgroundColor", "borderRadius", "padding"]),
      cardBackgrounds: cards.map((c) => getComputedStyle(c).backgroundColor),
      tile: pick(tile, ["width", "height", "borderRadius", "backgroundColor"]),
      value: pick(value, ["fontSize", "fontWeight"]),
    };
  });
}

/** The design is a client-rendered `.dc.html`; wait for its runtime to mount. */
async function openDesign(page: Page) {
  await page.setViewportSize({ width: 1440, height: 3400 });
  await page.goto(DESIGN, { waitUntil: "networkidle" });
  await page.locator("[data-screen-label='Dashboard']").waitFor({ state: "visible" });
  await page.evaluate(() => document.fonts.ready);
}

async function openApp(page: Page) {
  await page.setViewportSize({ width: 1440, height: 3400 });
  await page.goto("/");
  await page.getByRole("complementary").waitFor({ state: "visible" });
  await page.waitForLoadState("networkidle", { timeout: 45_000 }).catch(() => {});
  await page
    .locator(".MuiSkeleton-root")
    .last()
    .waitFor({ state: "detached", timeout: 30_000 })
    .catch(() => {});
  await page.evaluate(() => document.fonts.ready);
}

test.describe("dashboard matches the design", () => {
  test("KPI row carries the design's chrome", async ({ page, context }) => {
    const designPage = await context.newPage();
    await openDesign(designPage);
    const design = await readKpiChrome(designPage);
    await designPage.close();

    await openApp(page);
    const app = await readKpiChrome(page);

    // Printed as well as asserted: when this fails you want both sides, not
    // just the one property that differed.
    console.log("DESIGN", JSON.stringify(design));
    console.log("APP   ", JSON.stringify(app));

    expect(design.found, "found the design's KPI row").toBe(true);
    expect(app.found, "found the app's KPI row").toBe(true);

    expect(app.card.borderRadius, "card radius").toBe(design.card.borderRadius);
    expect(app.card.padding, "card padding").toBe(design.card.padding);
    expect(app.gap, "KPI grid gap").toBe(design.gap);
    expect(app.value.fontSize, "KPI value size").toBe(design.value.fontSize);
    expect(app.value.fontWeight, "KPI value weight").toBe(design.value.fontWeight);
    expect(app.tile.width, "glyph tile width").toBe(design.tile.width);
    expect(app.tile.borderRadius, "glyph tile radius").toBe(design.tile.borderRadius);

    // The design tints the whole card by what the metric measures and leaves
    // the glyph tile on the surface colour. Getting this backwards is the
    // difference between a row that reads as a status line and one that reads
    // as four identical white boxes.
    expect(app.tile.backgroundColor, "glyph tile sits on the surface colour").toBe(
      design.tile.backgroundColor,
    );
    expect(new Set(app.cardBackgrounds).size, "every KPI card tinted by its own tone").toBe(
      new Set(design.cardBackgrounds).size,
    );
  });
});

/**
 * The design's own layout, per role, read by stepping its role switcher.
 *
 * `packages/configurations/src/dashboard-roles.test.ts` asserts our page
 * configuration against this same table. That test is fast and runs in `bun
 * test`; this one exists so the table cannot drift away from the design without
 * anybody noticing — if the design moves a block, this fails and the unit test
 * is then wrong on purpose.
 */
const DESIGN_LAYOUT: Record<string, string[]> = {
  Owner: ["grid4", "blk", "blk", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  Admin: ["grid4", "blk", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  "Account Manager": ["grid4", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  "Team Lead": ["grid4", "blk", "grid2", "blk", "grid2", "grid2", "blk", "grid2"],
  Recruiter: ["grid4", "blk", "grid2", "blk", "grid2", "grid2", "blk", "grid2"],
  Sourcer: ["grid4", "blk", "grid2", "blk", "blk", "grid2", "grid2", "blk", "grid2"],
  "Hiring Manager": ["grid4", "blk", "grid2", "blk", "grid2", "grid2", "blk", "grid2"],
};

test("the design still lays each role out the way our configuration assumes", async ({
  context,
}) => {
  const page = await context.newPage();
  await openDesign(page);

  for (const [role, expected] of Object.entries(DESIGN_LAYOUT)) {
    const shape = await page.evaluate((name) => {
      // The runtime exposes the screen's props; stepping `role` is how the
      // design itself previews the other six dashboards.
      (window as unknown as { __dcSetProps: (n: string, p: unknown) => void }).__dcSetProps(
        "Root",
        { role: name },
      );
      return new Promise<string[]>((resolve) => {
        setTimeout(() => {
          const stack = document.querySelector("[data-screen-label='Dashboard'] main")?.children[1];
          resolve(
            [...(stack?.children ?? [])].map((el) => {
              const style = getComputedStyle(el);
              return style.display === "grid"
                ? `grid${style.gridTemplateColumns.split(" ").length}`
                : "blk";
            }),
          );
        }, 400);
      });
    }, role);
    expect(shape, `${role} block shape`).toEqual(expected);
  }
  await page.close();
});
