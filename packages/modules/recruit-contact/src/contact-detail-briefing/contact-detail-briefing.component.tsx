"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import type { ContactDetailBriefingConfiguration } from "./contact-detail-briefing.configuration";

interface Briefing {
  prose: string;
  basis: { openJobs: number; pending: number; decided: number; submitted: number };
}

/**
 * The design's relationship summary. It reads as prose but is assembled from
 * the figures the rest of the screen shows — there is no message history to
 * summarise, so the footnote names what it was built from.
 */
export function ContactDetailBriefingComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ContactDetailBriefingConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Briefing>(id, { filters: { id: params.id } });

  if (!config?.title) return null;

  return (
    <Card
      variant="base"
      sx={{
        p: "16px 20px",
        background: (theme) =>
          `linear-gradient(120deg,${theme.palette.surface.heroTint},rgba(28,28,27,.4) 60%),${theme.palette.surface.paper}`,
        border: "1px solid",
        borderColor: "surface.heroBorder",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "10px" }}>
        <Box sx={{ display: "flex", color: "surface.primarySoftFg" }}>
          <IconRenderer name={config.icon} size={16} />
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{t(config.title.name)}</Typography>
      </Box>

      {isLoading || !data ? (
        <>
          <Skeleton variant="text" height={18} />
          <Skeleton variant="text" height={18} width="88%" />
          <Skeleton variant="text" height={18} width="62%" />
        </>
      ) : (
        <>
          <Typography sx={{ fontSize: 13, lineHeight: 1.7, color: "surface.textMuted" }}>
            {data.prose}
          </Typography>
          <Typography sx={{ fontSize: 10.5, color: "surface.textDisabled", mt: "10px" }}>
            {t(config.footnote.name, {
              submitted: data.basis.submitted,
              decided: data.basis.decided,
            })}
          </Typography>
        </>
      )}
    </Card>
  );
}
