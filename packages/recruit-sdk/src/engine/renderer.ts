import type { Configuration, LayoutElement, RenderTree, Route } from "../types";
import { findBestMatchBranch } from "./router";

/**
 * The key a LayoutElement's dependencies (configuration, translation, data,
 * datasource) are stored under — the **component id**, not the element id.
 *
 * All four come from the ComponentDefinition, so keying by component id lets a
 * nested renderer config name its own component and have `useTranslation(id)`
 * resolve. Keying by element id instead means a config can never know its key,
 * and every translated nested config silently falls back to raw keys.
 *
 * Consequence: two elements sharing a componentType on one page share one
 * dependency slot. That is correct for config/translation/datasource; only
 * per-element `prefetch` would collide, and last write wins.
 */
export const dependencyKey = (element: LayoutElement): string =>
  element.componentType ?? element.id;

export const generateRenderTree = (
  matchedRoutes: Route[] | null,
  allConfigurations: Configuration[],
  allRoutes: Route[],
  slugParts: string[],
): RenderTree | null => {
  if (!matchedRoutes || matchedRoutes.length === 0) return null;
  const configMap = new Map(allConfigurations.map((c) => [c.id, c]));
  const renderTree: RenderTree = { layouts: [], page: null, slots: {} };

  for (const route of matchedRoutes) {
    if (route.layout) {
      const layoutConfig = configMap.get(route.layout);
      if (layoutConfig) renderTree.layouts.push(layoutConfig);
    }
  }

  const lastRoute = matchedRoutes[matchedRoutes.length - 1];
  if (lastRoute?.page) renderTree.page = configMap.get(lastRoute.page) || null;

  for (const layoutConfig of renderTree.layouts) {
    for (const element of layoutConfig.elements) {
      if (element.type === "slot" && element.name) {
        const slotName = element.name;
        const slotRoutes = allRoutes.filter((r) => r.slot === slotName);
        const matchedSlotBranch = findBestMatchBranch(
          slugParts,
          slotRoutes,
          new Map(allRoutes.map((r) => [r.id, r])),
        );
        if (matchedSlotBranch) {
          renderTree.slots[slotName] = generateRenderTree(
            matchedSlotBranch,
            allConfigurations,
            allRoutes,
            slugParts,
          );
        }
      }
    }
  }
  return renderTree;
};
