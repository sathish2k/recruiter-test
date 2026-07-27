"use client";

import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import { BrandLogo, BrandWordmark, IconRenderer, LinkRenderer } from "@recruit/shared";
import { useState } from "react";
import type { SidenavConfig } from "./sidenav.configuration";

export function SidenavComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: Partial<SidenavConfig>;
  currentRoute?: Route | null;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const [collapsed, setCollapsed] = useState(false);
  const groups = (configuration?.groups ?? []).filter((group) => group.items.length > 0);
  const promo = configuration?.promo;
  // Full path of the current route (child paths are built from their parent's),
  // so a nav item is active on its own route and on any descendant (e.g. the
  // "Jobs" item stays active on the New/Edit Job child routes).
  const currentPath = currentRoute ? router.getPathFromRouteId(currentRoute.id) : "";

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? 76 : 248,
        flexShrink: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        p: collapsed ? "22px 14px" : "22px 18px",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        transition: "width .18s ease",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          mb: "26px",
        }}
      >
        {!collapsed ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "text.primary",
            }}
          >
            <BrandLogo size={30} />
            <BrandWordmark fontSize={16.5} />
          </Box>
        ) : null}
        <Box
          onClick={() => setCollapsed((c) => !c)}
          title={collapsed ? t("expand") : t("collapse")}
          sx={{
            width: 26,
            height: 26,
            flexShrink: 0,
            borderRadius: "7px",
            border: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.disabled",
            cursor: "pointer",
            "&:hover": { color: "text.primary", background: "action.hover" },
          }}
        >
          {collapsed ? (
            <ChevronRightRounded sx={{ fontSize: 16 }} />
          ) : (
            <ChevronLeftRounded sx={{ fontSize: 16 }} />
          )}
        </Box>
      </Box>

      {groups.map((group, gi) => (
        <Box key={group.title}>
          {gi > 0 ? <Divider sx={{ my: "14px" }} /> : null}
          {!collapsed ? (
            <Typography
              sx={{
                fontSize: 11,
                letterSpacing: ".12em",
                color: "text.disabled",
                mt: gi === 0 ? "6px" : 0,
                mb: "10px",
              }}
            >
              {t(group.title)}
            </Typography>
          ) : null}
          <Box
            component="nav"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              ...(collapsed
                ? { mt: gi === 0 ? "6px" : 0 }
                : {
                    borderLeft: "1px solid",
                    borderColor: "divider",
                    pl: "10px",
                  }),
            }}
          >
            {group.items.map((item) => {
              const itemPath = router.getPathFromRouteId(item.routeId);
              // Exact match, or the current route is a descendant of this item.
              // Guard `length > 1` so the root ("/") isn't active everywhere.
              const active =
                item.routeId === currentRoute?.id ||
                (itemPath.length > 1 && currentPath.startsWith(`${itemPath}/`));
              return (
                <Box
                  key={item.routeId}
                  onClick={() => router.push(item.routeId)}
                  title={collapsed ? t(item.label) : undefined}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : "10px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    p: collapsed ? "10px" : "9px 12px",
                    borderRadius: "9px",
                    fontSize: 13.5,
                    cursor: "pointer",
                    border: "1px solid transparent",
                    ...(active
                      ? {
                          background:
                            "linear-gradient(90deg,var(--mui-palette-surface-primarySoftBorder),var(--mui-palette-surface-primarySoftBg))",
                          borderColor: "var(--mui-palette-surface-primarySoftBorder)",
                          fontWeight: 600,
                          color: "text.primary",
                        }
                      : {
                          color: "text.secondary",
                          "&:hover": {
                            background: "action.hover",
                            color: "text.primary",
                          },
                        }),
                  }}
                >
                  <IconRenderer name={item.icon} size={19} />
                  {collapsed ? null : t(item.label)}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}

      <Box sx={{ flex: 1, minHeight: "18px" }} />
      {promo && !collapsed ? (
        <Card variant="promo">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: 14.5,
              fontWeight: 700,
              mb: "8px",
            }}
          >
            <IconRenderer name={promo.icon} size={17} />
            {t(promo.title)}
          </Box>
          <Typography sx={{ fontSize: 12, lineHeight: 1.45, color: "text.secondary", mb: "12px" }}>
            {t(promo.body)}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Button
              variant="contained"
              onClick={() => router.push(promo.cta.routeId)}
              sx={{ fontSize: 12.5, py: "8px", px: "14px" }}
            >
              {t(promo.cta.label)}
            </Button>
            {promo.secondary ? (
              <LinkRenderer
                config={{
                  id,
                  routeId: promo.secondary.routeId,
                  label: { name: promo.secondary.label },
                  sx: { fontSize: 12.5, color: "text.secondary" },
                }}
              />
            ) : null}
          </Box>
        </Card>
      ) : null}
    </Box>
  );
}
