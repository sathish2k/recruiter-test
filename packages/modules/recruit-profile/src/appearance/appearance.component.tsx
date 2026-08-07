"use client";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { IconRenderer, ListSection } from "@recruit/shared";
import { useColorMode } from "@recruit/ui";
import { useState } from "react";
import type { AppearanceConfiguration } from "./appearance.configuration";

export function AppearanceComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AppearanceConfiguration>(id);
  const { mode, setMode } = useColorMode();
  // ponytail: accent + UI density have no persistence yet — local preview only.
  const [accent, setAccent] = useState(config.accents?.[0] ?? "#0E2E5C");
  const [prefs, setPrefs] = useState<Record<string, boolean>>({});

  if (!config.themeOptions) return null;

  const themeControl = (
    <Box
      sx={{
        display: "flex",
        gap: "4px",
        p: "4px",
        width: 220,
        flex: "none",
        borderRadius: "11px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.default",
      }}
    >
      {config.themeOptions.map((option) => {
        const active = mode === option.value;
        return (
          <Box
            key={option.value}
            onClick={() => setMode(option.value)}
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              py: "7px",
              borderRadius: "8px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              bgcolor: active ? "surface.hover" : "transparent",
              color: active ? "text.primary" : "text.secondary",
            }}
          >
            <IconRenderer name={option.icon} size={15} />
            {t(option.label)}
          </Box>
        );
      })}
    </Box>
  );

  const accentControl = (
    <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
      {config.accents.map((color) => (
        <Box
          key={color}
          role="button"
          aria-label={color}
          onClick={() => setAccent(color)}
          sx={{
            width: 24,
            height: 24,
            borderRadius: "7px",
            bgcolor: color,
            cursor: "pointer",
            border: "2px solid",
            borderColor: accent === color ? "text.primary" : "transparent",
          }}
        />
      ))}
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 920 }}>
      <ListSection
        title={t("title")}
        items={[
          {
            key: "theme",
            title: t("theme.title"),
            description: t("theme.description"),
            action: themeControl,
          },
          {
            key: "accent",
            title: t("accent.title"),
            description: t("accent.description"),
            action: accentControl,
          },
          ...config.uiPrefs.map((pref) => ({
            key: pref.key,
            title: t(pref.label),
            description: t(pref.description),
            action: (
              <Switch
                checked={!!prefs[pref.key]}
                onChange={(e) => setPrefs((prev) => ({ ...prev, [pref.key]: e.target.checked }))}
              />
            ),
          })),
        ]}
      />
    </Box>
  );
}
