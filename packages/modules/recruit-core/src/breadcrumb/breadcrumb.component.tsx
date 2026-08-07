"use client";

import { useRouteBranch } from "@recruit/sdk";
import { type BreadcrumbCrumb, BreadcrumbRenderer } from "@recruit/shared";
import type { BreadcrumbConfig } from "./breadcrumb.configuration";

/**
 * The trail, derived from the matched route branch rather than configured per
 * screen — the tree already knows where a record sits, so restating it on
 * every detail page would be a second source of truth that can drift.
 *
 * It renders in the layout's `breadcrumb` slot, above the page. That is also
 * why the leaf is the record *type* ("Candidate") and not the record's name:
 * the name lives in the page's own fetch, which a layout slot cannot reach,
 * and the detail header prints it directly underneath anyway. Callers that do
 * hold the record can use `BreadcrumbRenderer` with a `textPath` instead.
 */
export function BreadcrumbComponent({
  id,
  configuration,
}: {
  id: string;
  configuration?: BreadcrumbConfig;
}) {
  const branch = useRouteBranch();

  if (!configuration) return null;

  const crumbs: BreadcrumbCrumb[] = [];
  for (const route of branch) {
    const label = configuration.routes[route.id];
    // Unnamed routes — bare `:id` segments, layout-only nodes — add nothing.
    if (!label) continue;
    crumbs.push({ label: { name: label }, routeId: route.id });
  }

  // A single crumb is just the page's own title, which the head already prints.
  if (crumbs.length < 2) return null;

  return (
    <BreadcrumbRenderer
      id={id}
      config={{
        home: configuration.home,
        collapseAfter: configuration.collapseAfter,
        // The page you are on is not a link.
        crumbs: crumbs.map((crumb, index) =>
          index === crumbs.length - 1 ? { ...crumb, routeId: undefined } : crumb,
        ),
      }}
    />
  );
}
