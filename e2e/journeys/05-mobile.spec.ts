import { expect, test } from "@playwright/test";
import { goto } from "../fixtures/app";

/**
 * `requirements.md` §6.5 — five screens must be usable one-handed at 390px.
 * Runs under the `mobile` project only.
 */
test.describe("Mobile layouts", () => {
  test("the dashboard does not scroll horizontally", async ({ page }) => {
    await goto(page, "/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("the candidate form does not scroll horizontally", async ({ page }) => {
    await goto(page, "/candidates/new");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test.fixme("the pipeline board is usable one-handed", async () => {});
  test.fixme("schedule interview is usable one-handed", async () => {});
  test.fixme("the scorecard is usable one-handed", async () => {});
});
