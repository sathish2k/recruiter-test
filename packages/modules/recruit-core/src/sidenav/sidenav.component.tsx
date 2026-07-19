"use client";

import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import { BrandLogo, BrandWordmark, IconRenderer } from "@recruit/shared";
import { useState } from "react";
import type { SidenavGroup } from "./sidenav.configuration";

export function SidenavComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: { groups?: SidenavGroup[] };
  currentRoute?: Route | null;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const [collapsed, setCollapsed] = useState(false);
  const groups = (configuration?.groups ?? []).filter((group) => group.items.length > 0);

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
          {gi > 0 ? <Divider sx={{ my: "20px" }} /> : null}
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
              const active = item.routeId === currentRoute?.id;
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
                            "linear-gradient(90deg,rgba(242,106,27,.28),rgba(242,106,27,.05))",
                          borderColor: "rgba(242,106,27,.35)",
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
    </Box>
  );
}
