"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { type AccessRule, type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import { SlidingPillTabs } from "../../tabs/sliding-pill-tabs";
import { IconRenderer } from "../icon-renderer";

export interface TabNavItem {
  /** Translation key for the pill label. */
  label: string;
  /** Route this pill navigates to; also matched against `currentRoute`. */
  routeId: string;
  /** ICON_REGISTRY name — the leading glyph on a `vertical` rail row. */
  icon?: string;
  /** Optional soft chip beside the label (translation key), e.g. `Enterprise`. */
  badge?: string;
  /** Stripped by the engine when the user can't access it. */
  access?: AccessRule;
}

export interface TabNavConfiguration {
  /** Section title (translation key). */
  title?: string;
  /** Section subtitle (translation key). */
  subtitle?: string;
  /** Optional inline link rendered after the subtitle. */
  subtitleLink?: { text: string; routeId: string };
  /**
   * `horizontal` (default) is the sliding pill bar. `vertical` is the settings
   * rail: a sticky column of icon rows sitting in its own grid track, with the
   * page title carried by the appbar rather than the nav.
   */
  orientation?: "horizontal" | "vertical";
  tabs: TabNavItem[];
}

/**
 * Config-driven pill tab bar with an optional titled header — the shared shell
 * behind every "tabs across the top of a settings-style area" screen. Each area
 * (workspace settings, my-account, …) is one `ComponentDefinition` pointing its
 * `value` here with its own `.Configuration` + `.Translation`; the engine
 * injects `configuration`/`currentRoute` and strips any tab the user can't see.
 */
export function TabNavRenderer({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: Partial<TabNavConfiguration> & { tabs?: TabNavItem[] };
  currentRoute?: Route | null;
}) {
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const tabs = configuration?.tabs ?? [];
  const activeRouteId =
    tabs.find((tab) => tab.routeId === currentRoute?.id)?.routeId ?? tabs[0]?.routeId;
  const subtitleLink = configuration?.subtitleLink;

  if (configuration?.orientation === "vertical") {
    return (
      <Box
        component="nav"
        sx={{
          position: "sticky",
          top: "20px",
          alignSelf: "start",
          display: "flex",
          flexDirection: "column",
          gap: "2px",
        }}
      >
        {tabs.map((tab) => {
          const active = tab.routeId === activeRouteId;
          return (
            <Box
              key={tab.routeId}
              onClick={() => router.push(tab.routeId)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                p: "10px 12px",
                borderRadius: "8px",
                fontSize: 13.5,
                cursor: "pointer",
                transition: "var(--recruit-motion-state)",
                ...(active
                  ? {
                      bgcolor: "surface.primarySoftBg",
                      color: "surface.primarySoftFg",
                      fontWeight: 700,
                    }
                  : {
                      color: "text.secondary",
                      fontWeight: 600,
                      "&:hover": { bgcolor: "surface.hover", color: "text.primary" },
                    }),
              }}
            >
              {tab.icon ? <IconRenderer name={tab.icon} size={19} /> : null}
              {t(tab.label)}
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {configuration?.title || configuration?.subtitle ? (
        <Box>
          {configuration?.title ? (
            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{t(configuration.title)}</Typography>
          ) : null}
          {configuration?.subtitle ? (
            <Typography sx={{ fontSize: 12.5, color: "text.disabled", mt: "2px" }}>
              {t(configuration.subtitle)}
              {subtitleLink ? (
                <>
                  {" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => router.push(subtitleLink.routeId)}
                    sx={{ fontSize: 12.5, fontWeight: 600, color: "warning.light" }}
                  >
                    {t(subtitleLink.text)}
                  </Link>
                </>
              ) : null}
            </Typography>
          ) : null}
        </Box>
      ) : null}

      <SlidingPillTabs
        items={tabs.map((tab) => ({
          value: tab.routeId,
          render: (active: boolean) => (
            <>
              {t(tab.label)}
              {tab.badge ? (
                <Box
                  component="span"
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: active ? "#fff" : "warning.light",
                    bgcolor: active
                      ? "rgba(255,255,255,.2)"
                      : "var(--mui-palette-surface-warningSoftBg)",
                    border: active
                      ? "1px solid rgba(255,255,255,.3)"
                      : "1px solid var(--mui-palette-surface-warningSoftBorder)",
                    borderRadius: "999px",
                    px: "7px",
                    py: "2px",
                  }}
                >
                  {t(tab.badge)}
                </Box>
              ) : null}
            </>
          ),
        }))}
        value={activeRouteId}
        onChange={(routeId) => router.push(routeId)}
      />
    </Box>
  );
}
