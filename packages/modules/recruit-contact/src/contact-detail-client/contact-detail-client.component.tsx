"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { EntityRenderer, IconRenderer, LinkRenderer } from "@recruit/shared";
import delve from "dlv";
import type { ContactDetailClientConfiguration } from "./contact-detail-client.configuration";

interface ClientCard {
  id: string;
  name: string;
  industry: string;
  since: string;
  openJobs: number;
  candidates: number;
  waitingFeedback: number;
}

/** The whole card is a link through to the client detail screen. */
export function ContactDetailClientComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ContactDetailClientConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<ClientCard>(id, { filters: { id: params.id } });

  if (!config?.entity) return null;
  // A contact with no client has no card to draw.
  if (!isLoading && !data?.id) return null;

  if (isLoading || !data) {
    return (
      <Card variant="base" sx={{ p: "18px 20px" }}>
        <Skeleton variant="rounded" height={38} sx={{ borderRadius: "11px" }} />
        <Skeleton variant="rounded" height={52} sx={{ mt: "12px", borderRadius: "10px" }} />
      </Card>
    );
  }

  const record = {
    ...data,
    metaLine: [data.industry, data.since ? t("client.since", { date: data.since }) : ""]
      .filter(Boolean)
      .join(" · "),
  } as Record<string, unknown>;

  return (
    <LinkRenderer
      config={{
        id,
        routeId: config.routeId,
        params: { id: { type: "dynamic", path: "id" } },
        sx: { display: "block" },
      }}
      data={record}
    >
      <Card
        variant="base"
        sx={{ p: "18px 20px", "&:hover": { borderColor: "surface.primarySoftBorder" } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <EntityRenderer config={config.entity} data={record} />
          </Box>
          <Box sx={{ display: "flex", color: "surface.textDisabled", flex: "none" }}>
            <IconRenderer name="arrow-forward" size={16} />
          </Box>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "8px",
            mt: "12px",
          }}
        >
          {config.stats.map((stat) => (
            <Box
              key={stat.key}
              sx={{
                bgcolor: "surface.inset",
                border: "1px solid",
                borderColor: "surface.border",
                borderRadius: "10px",
                p: "8px 10px",
              }}
            >
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: stat.accent ? "surface.accentBright" : "text.primary",
                }}
              >
                {String(delve(record, stat.path) ?? 0)}
              </Typography>
              <Typography sx={{ fontSize: 10, color: "text.disabled" }}>
                {t(stat.label.name)}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </LinkRenderer>
  );
}
