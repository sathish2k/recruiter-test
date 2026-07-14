"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import {
  type Route,
  useAuthUser,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import type { AppbarAction } from "./appbar.configuration";

function initials(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppbarComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: {
    titles?: Record<string, string>;
    actions?: AppbarAction[];
  };
  currentRoute?: Route | null;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const user = useAuthUser();
  const titleKey = configuration?.titles?.[currentRoute?.id ?? ""];
  const actions = configuration?.actions ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "26px",
        py: "16px",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
        {titleKey ? t(titleKey) : ""}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {actions.map((action) => {
          const go = () => action.routeId && router.push(action.routeId);
          if (action.kind === "avatar") {
            return (
              <Avatar
                key="avatar"
                onClick={go}
                title={user?.name ?? undefined}
                sx={{ bgcolor: "#5B4A3A", color: "#FFD9BC", cursor: "pointer" }}
              >
                {initials(user?.name) || t(action.label ?? "")}
              </Avatar>
            );
          }
          return (
            <IconButton
              key={action.icon}
              onClick={go}
              sx={{ width: 32, height: 32 }}
            >
              {action.icon ? (
                <IconRenderer name={action.icon} size={16} />
              ) : null}
              {action.badge ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: "999px",
                    bgcolor: "primary.main",
                    border: "2px solid #131313",
                  }}
                />
              ) : null}
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
}
