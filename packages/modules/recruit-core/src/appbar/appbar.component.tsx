"use client";

import CheckRounded from "@mui/icons-material/CheckRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LanguageRounded from "@mui/icons-material/LanguageRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useAuthUser, useFetch, useLogout, usePortalRouter, useTranslation } from "@recruit/sdk";
import { BrandLogo, IconRenderer, LinkRenderer, seedRecord } from "@recruit/shared";
import { useColorMode } from "@recruit/ui";
import { useState } from "react";
import type { AppbarComponentProps, AppbarMenuItem } from "./appbar.types";

function initials(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function AppbarComponent({ id, configuration, currentRoute, data }: AppbarComponentProps) {
  const router = usePortalRouter();
  const { t, language, setLanguage } = useTranslation(id);
  const user = useAuthUser();
  const logout = useLogout();
  // The workspace row in the avatar menu — name + seat count.
  const { data: fetched } = useFetch<Record<string, unknown>>(id, { data: seedRecord(data) });
  const organization = (fetched ?? {}) as { name?: string; seats?: number };
  const [avatarMenu, setAvatarMenu] = useState<HTMLElement | null>(null);
  const [langMenu, setLangMenu] = useState<HTMLElement | null>(null);
  const { mode: themeMode, toggle: toggleTheme } = useColorMode();
  const titleKey = configuration?.titles?.[currentRoute?.id ?? ""];
  const backLink = configuration?.back?.[currentRoute?.id ?? ""];
  const subtitleKey = configuration?.subtitles?.[currentRoute?.id ?? ""];
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
        gap: "16px",
        minHeight: 72,
        px: "28px",
        py: "14px",
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {backLink ? (
        <LinkRenderer config={{ id, ...backLink }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: 13.5,
              fontWeight: 600,
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <IconRenderer name="arrow-back" size={16} />
            {backLink.label ? t(backLink.label.name) : null}
          </Box>
        </LinkRenderer>
      ) : (
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
              fontSize: 24,
              fontWeight: 700,
              letterSpacing: "-.01em",
            }}
          >
            {titleKey ? t(titleKey) : ""}
          </Typography>
          {subtitleKey ? (
            <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
              {t(subtitleKey)}
            </Typography>
          ) : null}
        </Box>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {actions.map((action) => {
          const go = () => action.routeId && router.push(action.routeId);
          if (action.kind === "theme") {
            return (
              <IconButton
                key="theme"
                onClick={toggleTheme}
                title={t("theme")}
                sx={{ width: 36, height: 36 }}
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
                    height: 36,
                    px: "13px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: "surface.border",
                    color: "text.secondary",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: 700,
                    letterSpacing: ".04em",
                    "&:hover": {
                      bgcolor: "action.hover",
                      color: "text.primary",
                    },
                  }}
                >
                  <LanguageRounded sx={{ fontSize: 18 }} />
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
            const menu = action.menu;
            const sections = (menu?.sections ?? []).filter((section) => section.length > 0);
            const roleLabel = menu?.role?.labels?.[user?.role ?? ""];
            return (
              <Box key="avatar">
                <Avatar
                  onClick={(e) => (sections.length ? setAvatarMenu(e.currentTarget) : go())}
                  title={user?.name ?? undefined}
                  sx={{
                    bgcolor: "var(--mui-palette-surface-primarySoftBg)",
                    color: "var(--mui-palette-surface-primarySoftFg)",
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
                  slotProps={{ list: { sx: { p: 0, width: 270 } } }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      p: "15px 16px",
                      bgcolor: "surface.primarySoftBg",
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        fontSize: 14,
                        bgcolor: "var(--mui-palette-surface-primarySoftBg)",
                        color: "var(--mui-palette-surface-primarySoftFg)",
                      }}
                    >
                      {initials(user?.name) || t(action.label ?? "")}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 700 }}>
                        {user?.name}
                      </Typography>
                      <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary" }}>
                        {user?.email}
                      </Typography>
                      {roleLabel ? (
                        <Chip
                          variant="soft"
                          color="primary"
                          size="small"
                          icon={
                            menu?.role?.icon ? (
                              <IconRenderer name={menu.role.icon} size={12} color="inherit" />
                            ) : undefined
                          }
                          label={t(roleLabel)}
                          sx={{ mt: "5px", fontSize: 10.5, height: 20 }}
                        />
                      ) : null}
                    </Box>
                  </Box>

                  {menu?.workspace && organization.name ? (
                    <Box
                      onClick={() => {
                        setAvatarMenu(null);
                        if (menu.workspace?.routeId) router.push(menu.workspace.routeId);
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        p: "11px 16px",
                        borderTop: "1px solid",
                        borderColor: "divider",
                        bgcolor: "action.hover",
                        cursor: menu.workspace.routeId ? "pointer" : "default",
                      }}
                    >
                      <BrandLogo size={28} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 600 }}>
                          {organization.name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                          {t(menu.workspace.seats, organization)}
                        </Typography>
                      </Box>
                      <IconRenderer name="unfold-more" size={16} />
                    </Box>
                  ) : null}

                  {sections.flatMap((section, si) => [
                    ...(si > 0
                      ? [<Divider key={`divider-${section[0]?.label}`} sx={{ m: 0 }} />]
                      : []),
                    ...section.map((item) => (
                      <MenuItem
                        key={item.label}
                        onClick={() => runMenuItem(item)}
                        sx={{
                          gap: "11px",
                          mx: "6px",
                          my: "2px",
                          borderRadius: "8px",
                          fontSize: 13,
                          color: item.danger ? "error.light" : "text.secondary",
                          fontWeight: item.danger ? 600 : undefined,
                        }}
                      >
                        {item.icon ? (
                          <ListItemIcon sx={{ minWidth: "0 !important" }}>
                            <IconRenderer
                              name={item.icon}
                              size={18}
                              color={item.danger ? "inherit" : undefined}
                            />
                          </ListItemIcon>
                        ) : null}
                        {t(item.label)}
                      </MenuItem>
                    )),
                  ])}
                </Menu>
              </Box>
            );
          }
          return (
            <IconButton key={action.icon} onClick={go} sx={{ width: 36, height: 36 }}>
              <Badge
                variant={typeof action.badge === "number" ? "standard" : "dot"}
                badgeContent={typeof action.badge === "number" ? action.badge : undefined}
                invisible={!action.badge}
                color="secondary"
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": { border: "2px solid", borderColor: "background.paper" },
                }}
              >
                {action.icon ? <IconRenderer name={action.icon} size={18} /> : null}
              </Badge>
            </IconButton>
          );
        })}
      </Box>
    </Box>
  );
}
