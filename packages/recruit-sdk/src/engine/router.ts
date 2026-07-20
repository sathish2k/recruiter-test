import type { Route } from "../types";

export const findBestMatchBranch = (
  slugs: string[],
  candidateRoutes: Route[],
  routeMap: Map<string, Route>,
): Route[] | null => {
  const potentialMatches: {
    route: Route;
    specificity: number;
    segmentsConsumed: number;
  }[] = [];

  for (const route of candidateRoutes) {
    const pathSegments = route.path.split("/").filter((p) => p.length > 0);
    if (pathSegments.length > slugs.length) continue;
    let isMatch = true;
    let specificity = 0;
    for (let i = 0; i < pathSegments.length; i++) {
      if (pathSegments[i].startsWith(":")) specificity += 1;
      else if (pathSegments[i] === slugs[i]) specificity += 2;
      else {
        isMatch = false;
        break;
      }
    }
    if (isMatch) {
      potentialMatches.push({
        route,
        specificity,
        segmentsConsumed: pathSegments.length,
      });
    }
  }

  if (potentialMatches.length === 0) return null;
  potentialMatches.sort((a, b) =>
    a.specificity !== b.specificity
      ? b.specificity - a.specificity
      : b.segmentsConsumed - a.segmentsConsumed,
  );

  const bestCandidate = potentialMatches[0];
  const remainingSlugs = slugs.slice(bestCandidate.segmentsConsumed);
  const childIds = bestCandidate.route.children || [];
  if (remainingSlugs.length === 0) return [bestCandidate.route];

  if (childIds.length > 0) {
    const childRoutes = childIds.map((id) => routeMap.get(id)).filter((r): r is Route => !!r);
    const childBranch = findBestMatchBranch(remainingSlugs, childRoutes, routeMap);
    if (childBranch) return [bestCandidate.route, ...childBranch];
  }
  return null;
};

export const findRouteBySlug = (slugParts: string[] = [], routeList: Route[]): Route[] | null => {
  const mainRoutes = routeList.filter((r) => !r.slot);
  if (!slugParts || slugParts.length === 0 || (slugParts.length === 1 && slugParts[0] === "")) {
    const rootRoute = mainRoutes.find((route) => route.path === "/");
    return rootRoute ? [rootRoute] : null;
  }
  const routeMap = new Map(routeList.map((route) => [route.id, route]));
  const topLevelRoutes = mainRoutes.filter(
    (r) => !mainRoutes.some((p) => p.children.includes(r.id)),
  );
  return findBestMatchBranch(slugParts, topLevelRoutes, routeMap);
};
