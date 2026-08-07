"use client";

import Link, { type LinkProps } from "@mui/material/Link";
import { usePortalRouter, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import NextLink from "next/link";
import type { ReactNode } from "react";

export type LinkType = "route" | "external" | "auto";

export interface LinkParamConfig {
  type: "static" | "dynamic";
  value?: unknown;
  path?: string;
}

export interface LinkRendererConfig {
  /** Component id the `label.name` translation key resolves against. */
  id?: string;
  path?: string;
  linkType?: LinkType;
  routeId?: string;
  href?: string;
  /** Translation key for the link text (`{ name }`); takes priority over `text`. */
  label?: { name: string };
  text?: string;
  /** Data path for the link text, when the label lives in a different field
   * from the target — a document row shows its name, not its URL. */
  textPath?: string;
  target?: "_blank" | "_self" | "_parent" | "_top";
  variant?: LinkProps["variant"];
  color?: LinkProps["color"];
  underline?: LinkProps["underline"];
  params?: Record<string, LinkParamConfig>;
  queryParams?: Record<string, LinkParamConfig>;
  sx?: LinkProps["sx"];
}

function isExternal(value: string): boolean {
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("mailto:") ||
    value.startsWith("tel:")
  );
}

export function LinkRenderer({
  config,
  data = {},
  children,
}: {
  config: LinkRendererConfig;
  data?: Record<string, unknown>;
  children?: ReactNode;
}) {
  const { getPathFromRouteId } = usePortalRouter();
  const { t } = useTranslation(config.id ?? "");
  const {
    path,
    linkType = "auto",
    routeId,
    href,
    label,
    text,
    target = "_self",
    variant = "inherit",
    params = {},
    queryParams = {},
    sx,
  } = config;

  const value = path ? (delve(data, path) as string | undefined) : undefined;
  const fromPath = config.textPath
    ? (delve(data, config.textPath) as string | undefined)
    : undefined;
  const displayText = (label ? t(label.name) : text) || fromPath || value || "";
  const content = children ?? displayText;
  const underline = config.underline ?? (children ? "none" : "hover");
  const color = config.color ?? (children ? "inherit" : "primary");

  const finalType =
    linkType === "auto" ? (isExternal(value || href || "") ? "external" : "route") : linkType;

  const resolveParam = (param: LinkParamConfig) =>
    param.type === "dynamic" && param.path ? delve(data, param.path) : param.value;

  const buildRouteUrl = (): string => {
    const targetRouteId = routeId || value;
    if (!targetRouteId) return href ?? "#";
    const pathParams: Record<string, string> = {};
    for (const [key, param] of Object.entries(params)) {
      pathParams[key] = String(resolveParam(param));
    }
    let url = getPathFromRouteId(targetRouteId, pathParams);
    const query = Object.entries(queryParams)
      .map(([key, param]) => `${key}=${encodeURIComponent(String(resolveParam(param)))}`)
      .join("&");
    if (query) url += `?${query}`;
    return url;
  };

  if (finalType === "route") {
    return (
      <Link
        component={NextLink}
        href={buildRouteUrl()}
        variant={variant}
        color={color}
        underline={underline}
        sx={sx}
      >
        {content}
      </Link>
    );
  }

  return (
    <Link
      href={href || value || "#"}
      target={target}
      rel={target === "_blank" ? "noopener noreferrer" : undefined}
      variant={variant}
      color={color}
      underline={underline}
      sx={sx}
    >
      {content}
    </Link>
  );
}
