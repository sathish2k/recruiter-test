"use client";

import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type Route, useAuthUser, usePortalRouter, useTranslation } from "@recruit/sdk";
import { BrandLogo, BrandWordmark, IconRenderer } from "@recruit/shared";
import { useState } from "react";
import type { SidenavConfig } from "./sidenav.configuration";

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/** "accountManager" → "Account Manager". The rail prints the role the session
 * carries, including a custom one an agency invented. */
const roleLabel = (role: string) =>
  role.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase());

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
  const authUser = useAuthUser();
  const user = authUser?.name
    ? { name: authUser.name, caption: roleLabel(authUser.role ?? "") }
    : null;
  // Full path of the current route (child paths are built from their parent's),
  // so a nav item is active on its own route and on any descendant (e.g. the
  // "Jobs" item stays active on the New/Edit Job child routes).
  const currentPath = currentRoute ? router.getPathFromRouteId(currentRoute.id) : "";

  return (
    <Box
      component="aside"
      sx={{
        width: collapsed ? 88 : 248,
        flexShrink: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        bgcolor: "surface.rail",
        borderRight: "1px solid",
        borderColor: "divider",
        p: collapsed ? "20px 14px" : "20px 16px",
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
          mb: "24px",
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
            width: 28,
            height: 28,
            flexShrink: 0,
            borderRadius: "7px",
            border: "1px solid",
            borderColor: "surface.border",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            cursor: "pointer",
            "&:hover": { color: "text.primary", bgcolor: "action.hover" },
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
        // Three groups share the "RECRUITING" title (one per desk shape); only
        // one survives access filtering, but the key must still be unique.
        <Box key={`${group.title}-${gi}`}>
          {!collapsed ? (
            <Typography variant="overline" sx={{ display: "block", ml: "12px", mb: "8px" }}>
              {t(group.title)}
            </Typography>
          ) : null}
          <Box
            component="nav"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              mb: gi === groups.length - 1 ? 0 : "18px",
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
                    gap: collapsed ? 0 : "11px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    p: collapsed ? "10px" : "9px 12px",
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
                          "&:hover": { bgcolor: "surface.hover", color: "text.primary" },
                        }),
                  }}
                >
                  <IconRenderer name={item.icon} size={20} />
                  {collapsed ? null : t(item.label)}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}

      <Box sx={{ flex: 1, minHeight: "18px" }} />
      {!collapsed && user ? (
        <Box
          onClick={() => router.push("Recruit.Profile.Route")}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            p: "10px 12px",
            mt: "12px",
            borderRadius: "10px",
            cursor: "pointer",
            borderTop: "1px solid",
            borderColor: "divider",
            "&:hover": { bgcolor: "surface.hover" },
          }}
        >
          <Avatar sx={{ width: 34, height: 34, fontSize: 12.5 }}>{initials(user.name)}</Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontSize: 13, fontWeight: 700 }}>
              {user.name}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "text.secondary",
                fontSize: 11,
              }}
            >
              <IconRenderer name="certificate" size={13} />
              <Box
                component="span"
                sx={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {user.caption}
              </Box>
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
