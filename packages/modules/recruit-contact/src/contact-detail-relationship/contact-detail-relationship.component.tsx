"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { EntityRenderer, FactRows, IconRenderer, LinkRenderer } from "@recruit/shared";
import { useState } from "react";
import type { ContactDetailRelationshipConfiguration } from "./contact-detail-relationship.configuration";

interface Relationship {
  ownerName: string;
  lastTouch: string;
  health: string;
  healthPercent: number;
  avgReplyHours: number;
  replyRate: number;
  interactions90d: number;
  reference: string;
  source: string;
  addedAt: string;
}

/** Owner, how warm the relationship is, and the numbers behind that band. */
export function ContactDetailRelationshipComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ContactDetailRelationshipConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Relationship>(id, { filters: { id: params.id } });
  const [open, setOpen] = useState(false);

  if (!config?.fields) return null;

  if (isLoading || !data) {
    return (
      <Card variant="base" sx={{ p: "18px 20px" }}>
        <Skeleton variant="text" width={110} height={22} sx={{ mb: "10px" }} />
        <Skeleton variant="rounded" height={40} sx={{ borderRadius: "12px", mb: "12px" }} />
        <Skeleton variant="text" height={16} />
        <Skeleton variant="rounded" height={5} sx={{ mt: "10px", borderRadius: "999px" }} />
      </Card>
    );
  }

  const record = {
    ...data,
    ownerRole: t("relationship.ownerRole"),
    addedLabel: new Date(data.addedAt).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    replyRateLabel: `${data.replyRate}%`,
  } as Record<string, unknown>;

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "13px" }}>
        {t(config.title.name)}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "12px" }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <EntityRenderer config={config.owner} data={record} />
        </Box>
        <LinkRenderer
          config={{
            id,
            routeId: config.changeOwner.routeId,
            params: { id: { type: "dynamic", path: "id" } },
          }}
          data={{ id: params.id }}
        >
          <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "surface.textSecondary" }}>
            {t(config.changeOwner.label.name)}
          </Typography>
        </LinkRenderer>
      </Box>

      <Row label={t(config.lastTouchLabel.name)} value={data.lastTouch} tone="success" />
      <Divider sx={{ my: "13px" }} />

      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "7px" }}
      >
        <Typography sx={{ fontSize: 12, color: "surface.textMuted" }}>
          {t(config.healthLabel.name)}
        </Typography>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: "surface.successFg" }}>
          {t(`health.${data.health}`)}
        </Typography>
      </Box>
      <Box sx={{ height: 5, borderRadius: "999px", bgcolor: "surface.track", overflow: "hidden" }}>
        <Box
          sx={{
            width: `${data.healthPercent}%`,
            height: "100%",
            borderRadius: "999px",
            bgcolor: "surface.successFg",
          }}
        />
      </Box>

      <Box sx={{ mt: "11px" }}>
        <Row
          label={t(config.replyLabel.name)}
          value={data.avgReplyHours ? t("relationship.hours", { hours: data.avgReplyHours }) : "—"}
        />
      </Box>

      <Box
        onClick={() => setOpen((current) => !current)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "5px",
          mt: "12px",
          pt: "12px",
          borderTop: "1px solid",
          borderColor: "surface.divider",
          fontSize: 11.5,
          fontWeight: 600,
          color: "surface.textSecondary",
          cursor: "pointer",
          "&:hover": { color: "text.primary" },
        }}
      >
        <IconRenderer name={open ? "expand-less" : "expand-more"} size={15} />
        {t(open ? config.moreLabel.hide : config.moreLabel.show)}
      </Box>
      {open ? (
        <Box sx={{ mt: "10px" }}>
          <FactRows fields={config.fields} data={record} t={t} size="inset" />
        </Box>
      ) : null}
    </Card>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "success" }) {
  return (
    <Box sx={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
      <Typography sx={{ fontSize: 12.5, color: "surface.textMuted" }}>{label}</Typography>
      <Typography
        sx={{
          fontSize: 12.5,
          fontWeight: 700,
          color: tone === "success" ? "surface.successFg" : "text.primary",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
