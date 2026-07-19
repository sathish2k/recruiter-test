import type { Configuration, RenderTree, Route } from "../types";
import { findBestMatchBranch } from "./router";

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
