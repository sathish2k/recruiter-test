"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { IconRenderer, SearchField } from "@recruit/shared";
import { useMemo, useState } from "react";
import type { HelpCenterConfig } from "./help-center.configuration";

export function HelpCenterComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<HelpCenterConfig>(id);
  const [query, setQuery] = useState("");

  const articles = useMemo(
    () => config.articles.map((a) => ({ ...a, label: t(a.title) })),
    [config.articles, t],
  );
  const filtered = query.trim()
    ? articles.filter((a) =>
        a.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : articles;

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", width: "100%" }}>
      <Box sx={{ textAlign: "center", mb: "26px" }}>
        <Typography sx={{ fontSize: 28, fontWeight: 700, mb: "8px" }}>
          {t("heading")}
        </Typography>
        <Typography sx={{ fontSize: 14, color: "text.secondary", mb: "20px" }}>
          {t("subheading")}
        </Typography>
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder={t("searchPlaceholder")}
          sx={{ width: "100%", maxWidth: 460, mx: "auto" }}
        />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "14px",
          mb: "30px",
        }}
      >
        {config.categories.map((category) => (
          <Card
            key={category.key}
            variant="interactive"
            sx={{ display: "flex", gap: "13px", alignItems: "flex-start" }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
                bgcolor: "rgba(242,106,27,0.14)",
              }}
            >
              <IconRenderer name={category.icon} size={19} color="#FF9D57" />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                {t(category.name)}
              </Typography>
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: "text.secondary",
                  lineHeight: 1.5,
                  my: "5px",
                }}
              >
                {t(category.description)}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                {t("articleCount", { count: category.count })}
              </Typography>
            </Box>
          </Card>
        ))}
      </Box>

      <Typography variant="overline" sx={{ display: "block", mb: "12px" }}>
        {t("popular")}
      </Typography>
      {filtered.length === 0 ? (
        <Card
          variant="base"
          sx={{ textAlign: "center", py: "34px", color: "text.secondary" }}
        >
          <Typography sx={{ fontSize: 13.5 }}>
            {t("noMatch", { query: query.trim() })}
          </Typography>
        </Card>
      ) : (
        <Card variant="base" sx={{ p: "6px", mb: "24px" }}>
          {filtered.map((article) => (
            <Box
              key={article.key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                px: "14px",
                py: "13px",
                borderRadius: "11px",
                cursor: "pointer",
                "&:hover": { bgcolor: "rgba(255,255,255,0.04)" },
              }}
            >
              <IconRenderer
                name={config.articleIcon}
                size={17}
                color="#9A968E"
              />
              <Typography sx={{ flex: 1, fontSize: 13.5 }}>
                {article.label}
              </Typography>
              <IconRenderer
                name={config.chevronIcon}
                size={18}
                color="#7C7972"
              />
            </Box>
          ))}
        </Card>
      )}

      <Card
        variant="highlight"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "11px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "none",
            bgcolor: "rgba(242,106,27,0.14)",
          }}
        >
          <IconRenderer name={config.supportIcon} size={21} color="#FF9D57" />
        </Box>
        <Box sx={{ flex: 1, minWidth: 180 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            {t("support.title")}
          </Typography>
          <Typography
            sx={{ fontSize: 12.5, color: "text.secondary", mt: "2px" }}
          >
            {t("support.body")}
          </Typography>
        </Box>
        <Button
          variant="contained"
          href={config.supportEmail}
          startIcon={<IconRenderer name="mail" size={15} />}
        >
          {t("support.cta")}
        </Button>
      </Card>
    </Box>
  );
}
