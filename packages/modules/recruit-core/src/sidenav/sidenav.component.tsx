"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
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
  const groups = configuration?.groups ?? [];

  return (
    <Box
      component="aside"
      sx={{
        width: 248,
        flexShrink: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        p: "22px 18px",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "26px" }}
      >
        <Avatar
          variant="rounded"
          sx={{
            borderRadius: "9px",
            background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
          }}
        >
          {t("brand").charAt(0)}
        </Avatar>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          {t("brand")}
        </Typography>
      </Box>

      {groups.map((group, gi) => (
        <Box key={group.title}>
          {gi > 0 ? <Divider sx={{ my: "20px" }} /> : null}
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: ".12em",
              color: "#7C7972",
              mt: gi === 0 ? "6px" : 0,
              mb: "10px",
            }}
          >
            {t(group.title)}
          </Typography>
          <Box
            component="nav"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              borderLeft: "1px solid rgba(255,255,255,.07)",
              pl: "10px",
            }}
          >
            {group.items.map((item) => {
              const active = item.routeId === currentRoute?.id;
              return (
                <Box
                  key={item.routeId}
                  onClick={() => router.push(item.routeId)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    p: "9px 12px",
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
                          color: "#ECEAE7",
                        }
                      : {
                          color: "#9A968E",
                          "&:hover": {
                            background: "rgba(255,255,255,.05)",
                            color: "#ECEAE7",
                          },
                        }),
                  }}
                >
                  <IconRenderer name={item.icon} size={19} />
                  {t(item.label)}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
