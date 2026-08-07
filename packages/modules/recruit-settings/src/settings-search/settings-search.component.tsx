"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import { IconRenderer, SearchField } from "@recruit/shared";
import { useState } from "react";
import type { SettingsSearchConfig } from "./settings-search.configuration";

export function SettingsSearchComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<SettingsSearchConfig>(id);
  const router = usePortalRouter();
  const [query, setQuery] = useState("");

  const term = query.trim().toLowerCase();
  const matches = term
    ? (config.index ?? []).filter((entry) => t(entry.label).toLowerCase().includes(term))
    : [];

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
      <SearchField
        value={query}
        onChange={setQuery}
        placeholder={t(config.placeholder ?? "")}
        sx={{ flex: "none" }}
      />
      {term && matches.length === 0 ? (
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {t("empty", { query: query.trim() })}
        </Typography>
      ) : null}
      {matches.map((entry) => (
        <Box
          key={`${entry.routeId}-${entry.label}`}
          onClick={() => router.push(entry.routeId)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            height: 32,
            px: "12px",
            borderRadius: "8px",
            bgcolor: "background.paper",
            boxShadow: (theme) => `0 0 0 1px ${theme.palette.divider}`,
            fontSize: 12,
            fontWeight: 700,
            color: "text.secondary",
            cursor: "pointer",
            "&:hover": { bgcolor: "surface.hover" },
          }}
        >
          <IconRenderer name={entry.icon} size={15} />
          {t(entry.label)}
          <Box component="span" sx={{ fontSize: 11, fontWeight: 600, color: "text.disabled" }}>
            {t(entry.tab)}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
