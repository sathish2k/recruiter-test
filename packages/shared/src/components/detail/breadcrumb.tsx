"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { Fragment } from "react";
import { IconRenderer } from "../renderers/icon-renderer";
import { type LinkParamConfig, LinkRenderer } from "../renderers/link-renderer";

/** One step up the tree. The last crumb is the current record and is not a link. */
export interface BreadcrumbCrumb {
  /** Translation key for a fixed label ("Candidates"). */
  label?: { name: string };
  /** Data path, for the record's own name — which arrives after the fetch. */
  textPath?: string;
  /** Where it goes. Omit on the last crumb; a current page is not a link. */
  routeId?: string;
  href?: string;
  params?: Record<string, LinkParamConfig>;
}

export interface BreadcrumbConfig {
  /** Leading house glyph linking to the workspace root. */
  home?: { routeId: string };
  crumbs: BreadcrumbCrumb[];
  /**
   * Above this many crumbs the middle collapses to an ellipsis, keeping the
   * root and the last two. A path that wraps is worse than one that elides.
   */
  collapseAfter?: number;
}

const SEPARATOR = (
  <Box aria-hidden sx={{ color: "text.disabled", fontSize: 13, lineHeight: 1, userSelect: "none" }}>
    /
  </Box>
);

/**
 * Where the record sits, and one click back up. Mandatory on every detail
 * route — a recruiter arriving from an alert or a pasted link has no other
 * context for what they are looking at.
 */
export function BreadcrumbRenderer({
  id,
  config,
  data = {},
  isLoading,
}: {
  id: string;
  config: BreadcrumbConfig;
  data?: Record<string, unknown>;
  isLoading?: boolean;
}) {
  const { t } = useTranslation(id);
  const crumbs = config.crumbs ?? [];
  const limit = config.collapseAfter ?? 4;

  // Keep the root and the last two; the middle becomes one ellipsis.
  const shown =
    crumbs.length > limit
      ? [crumbs[0], "ellipsis" as const, ...crumbs.slice(-2)]
      : (crumbs as (BreadcrumbCrumb | "ellipsis")[]);

  return (
    <Box
      component="nav"
      aria-label={t("breadcrumb", { defaultValue: "Breadcrumb" })}
      sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", minWidth: 0 }}
    >
      {config.home ? (
        <>
          <LinkRenderer
            config={{
              id,
              routeId: config.home.routeId,
              sx: { display: "inline-flex", color: "text.secondary" },
            }}
          >
            <IconRenderer name="home" size={15} />
          </LinkRenderer>
          {SEPARATOR}
        </>
      ) : null}

      {shown.map((crumb, index) => {
        const key =
          crumb === "ellipsis"
            ? `ellipsis-${index}`
            : (crumb.label?.name ?? crumb.textPath ?? `crumb-${index}`);
        const last = index === shown.length - 1;

        if (crumb === "ellipsis") {
          return (
            <Fragment key={key}>
              <Box sx={{ color: "text.disabled", fontSize: 12.5, fontWeight: 700 }}>…</Box>
              {SEPARATOR}
            </Fragment>
          );
        }

        // The record's own name is the last thing to arrive; hold its width
        // rather than letting the row jump once the fetch lands.
        const text = crumb.textPath ? String(delve(data, crumb.textPath) ?? "") : undefined;
        if (last && crumb.textPath && (isLoading || !text)) {
          return <Skeleton key={key} variant="text" width={120} height={18} />;
        }

        const label = text ?? (crumb.label ? t(crumb.label.name) : "");

        return (
          <Fragment key={key}>
            {last || (!crumb.routeId && !crumb.href) ? (
              <Typography
                aria-current={last ? "page" : undefined}
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "text.primary",
                  maxWidth: 280,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Typography>
            ) : (
              <LinkRenderer
                config={{
                  id,
                  routeId: crumb.routeId,
                  href: crumb.href,
                  params: crumb.params,
                  sx: {
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "text.secondary",
                    "&:hover": { color: "text.primary", textDecoration: "underline" },
                  },
                }}
              >
                {label}
              </LinkRenderer>
            )}
            {last ? null : SEPARATOR}
          </Fragment>
        );
      })}
    </Box>
  );
}
