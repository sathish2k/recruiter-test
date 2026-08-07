"use client";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";

interface LegalConfig {
  /** How many `sections.N` blocks the translations carry. */
  sectionCount: number;
  links?: Record<string, LinkRendererConfig>;
  /** Marks the text as awaiting legal review, so nobody mistakes it for final. */
  draft?: boolean;
}

/**
 * A long-form legal document. One component, bound twice — Terms and Privacy
 * differ only in their translations, so they share this renderer rather than
 * duplicating a layout.
 */
export function LegalDocument({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { sectionCount, links, draft } = useConfiguration<LegalConfig>(id);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default", py: { xs: "40px", md: "72px" } }}>
      <Container maxWidth="md">
        {links?.back ? (
          <Box sx={{ mb: "28px" }}>
            <LinkRenderer config={{ ...links.back, text: t("back") }} />
          </Box>
        ) : null}

        <Typography component="h1" sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700 }}>
          {t("title")}
        </Typography>
        <Typography sx={{ mt: "8px", fontSize: 13, color: "surface.textMuted" }}>
          {t("updated")}
        </Typography>

        {draft ? (
          <Box
            sx={{
              display: "flex",
              gap: "11px",
              mt: "26px",
              p: "14px 16px",
              borderRadius: "12px",
              bgcolor: "surface.warningSoftBg",
              color: "surface.warningFg",
            }}
          >
            <Box sx={{ flex: "none", lineHeight: 1.2 }}>
              <IconRenderer name="warning" size={19} color="inherit" />
            </Box>
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, fontWeight: 600 }}>
              {t("draftNotice")}
            </Typography>
          </Box>
        ) : null}

        <Typography sx={{ mt: "26px", fontSize: 15, lineHeight: 1.75, color: "text.secondary" }}>
          {t("intro")}
        </Typography>

        {Array.from({ length: sectionCount }, (_, index) => (
          <Box key={t(`sections.${index}.heading`)} sx={{ mt: "34px" }}>
            <Typography component="h2" sx={{ fontSize: 18, fontWeight: 700 }}>
              {t(`sections.${index}.heading`)}
            </Typography>
            <Typography
              sx={{ mt: "10px", fontSize: 14.5, lineHeight: 1.75, color: "text.secondary" }}
            >
              {t(`sections.${index}.body`)}
            </Typography>
          </Box>
        ))}

        <Typography sx={{ mt: "44px", fontSize: 13, lineHeight: 1.7, color: "surface.textMuted" }}>
          {t("contact")}
        </Typography>
      </Container>
    </Box>
  );
}
