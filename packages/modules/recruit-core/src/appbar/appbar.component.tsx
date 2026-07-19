"use client";

import CheckRounded from "@mui/icons-material/CheckRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { type Route, useAuthUser, useLogout, usePortalRouter, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import { useColorMode } from "@recruit/ui";
import { useState } from "react";
import type { AppbarAction, AppbarMenuItem } from "./appbar.configuration";

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
  const { t, language, setLanguage } = useTranslation(id);
  const user = useAuthUser();
  const logout = useLogout();
  const [avatarMenu, setAvatarMenu] = useState<HTMLElement | null>(null);
  const [langMenu, setLangMenu] = useState<HTMLElement | null>(null);
  const { mode: themeMode, toggle: toggleTheme } = useColorMode();
  const titleKey = configuration?.titles?.[currentRoute?.id ?? ""];
  const actions = configuration?.actions ?? [];

  const runMenuItem = (item: AppbarMenuItem) => {
    setAvatarMenu(null);
    if (item.action === "logout") logout();
    else if (item.routeId) router.push(item.routeId);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "26px",
        py: "14px",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{titleKey ? t(titleKey) : ""}</Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {actions.map((action) => {
          const go = () => action.routeId && router.push(action.routeId);
          if (action.kind === "theme") {
            return (
              <IconButton
                key="theme"
                onClick={toggleTheme}
                title={t("theme")}
                sx={{ width: 32, height: 32 }}
              >
                {themeMode === "dark" ? <LightModeRounded /> : <DarkModeRounded />}
              </IconButton>
            );
          }
          if (action.kind === "language") {
            const languages = action.languages ?? [];
            return (
              <Box key="language">
                <Box
                  onClick={(e) => setLangMenu(e.currentTarget)}
                  title={t("language")}
                  sx={{
                    height: 32,
                    px: "11px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: "divider",
                    color: "text.secondary",
                    cursor: "pointer",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    "&:hover": {
                      background: "action.hover",
                      color: "text.primary",
                    },
                  }}
                >
                  <LanguageRounded sx={{ fontSize: 15 }} />
                  {(language || "en").toUpperCase()}
                </Box>
                <Menu
                  anchorEl={langMenu}
                  open={Boolean(langMenu)}
                  onClose={() => setLangMenu(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {languages.map((lang) => {
                    const active = lang.code === language;
                    return (
                      <MenuItem
                        key={lang.code}
                        selected={active}
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangMenu(null);
                        }}
                        sx={{
                          gap: "10px",
                          minWidth: 168,
                          justifyContent: "space-between",
                        }}
                      >
                        {lang.label}
                        {active ? (
                          <CheckRounded sx={{ fontSize: 15, color: "primary.light" }} />
                        ) : null}
                      </MenuItem>
                    );
                  })}
                </Menu>
              </Box>
            );
          }
          if (action.kind === "avatar") {
            const menu = action.menu ?? [];
            return (
              <Box key="avatar">
                <Avatar
                  onClick={(e) => (menu.length ? setAvatarMenu(e.currentTarget) : go())}
                  title={user?.name ?? undefined}
                  sx={{
                    bgcolor: "#5B4A3A",
                    color: "#FFD9BC",
                    cursor: "pointer",
                  }}
                >
                  {initials(user?.name) || t(action.label ?? "")}
                </Avatar>
                <Menu
                  anchorEl={avatarMenu}
                  open={Boolean(avatarMenu)}
                  onClose={() => setAvatarMenu(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  {user?.name ? (
                    <Box sx={{ px: "14px", py: "6px" }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{user.name}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                        {user.email}
                      </Typography>
                    </Box>
                  ) : null}
                  {menu.map((item) => (
                    <MenuItem
                      key={item.label}
                      onClick={() => runMenuItem(item)}
                      sx={{
                        gap: "10px",
                        minWidth: 172,
                        color: item.danger ? "error.light" : undefined,
                      }}
                    >
                      {item.icon ? (
                        <ListItemIcon sx={{ minWidth: "0 !important" }}>
                          <IconRenderer
                            name={item.icon}
                            size={16}
                            color={item.danger ? "inherit" : undefined}
                          />
                        </ListItemIcon>
                      ) : null}
                      {t(item.label)}
                    </MenuItem>
                  ))}
                </Menu>
              </Box>
            );
          }
          return (
            <IconButton key={action.icon} onClick={go} sx={{ width: 32, height: 32 }}>
              {action.icon ? <IconRenderer name={action.icon} size={16} /> : null}
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
                    border: "2px solid",
                    borderColor: "background.default",
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
