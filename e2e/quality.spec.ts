import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The CLAUDE.md pre-push gate: every shipped screen holds its layout at the
// three reference widths and passes an axe WCAG 2.0/2.1 AA scan.

const SCREENS = ["/login", "/create-account", "/verify", "/get-started", "/terms", "/privacy"];

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

for (const path of SCREENS) {
  for (const viewport of VIEWPORTS) {
    test(`${path} @ ${viewport.name} (${viewport.width}px) has no horizontal scroll`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(path);
      const overflow = await page.evaluate(() => {
        const root = document.scrollingElement;
        return root ? root.scrollWidth - window.innerWidth : 0;
      });
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test(`${path} has no axe WCAG violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
