"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer, LinkRenderer, ListRenderer, SlaMeter } from "@recruit/shared";
import type { ContactDetailWaitingConfiguration } from "./contact-detail-waiting.configuration";

interface Waiting {
  name: string;
  sla: {
    pending: number;
    slaHours: number;
    elapsedHours: number;
    remainingHours: number;
    percent: number;
    breached: boolean;
  };
  items: Record<string, unknown>[];
}

/** What this contact still owes a decision on, against the feedback SLA — the
 * contact-side twin of the client header's hero strip. */
export function ContactDetailWaitingComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ContactDetailWaitingConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Waiting>(id, { filters: { id: params.id } });

  if (!config?.row) return null;
  // Nothing owed is the good case — the design drops the card entirely.
  if (!isLoading && !data?.sla.pending) return null;

  const sla = data?.sla;

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          rowGap: "8px",
          flexWrap: "wrap",
          mb: "14px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Box sx={{ display: "flex", color: "surface.accentBright" }}>
            <IconRenderer name={config.icon} size={17} />
          </Box>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
            {t(config.title.name, { name: data?.name ?? "" })}
          </Typography>
          {sla ? <Chip variant="soft" color="primary" size="small" label={sla.pending} /> : null}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {sla ? (
            <SlaMeter
              label={t(config.slaLabel.name, { hours: sla.slaHours })}
              percent={sla.percent}
              trailing={t(config.remainingLabel.name, { hours: sla.remainingHours })}
              breached={sla.breached}
              width={110}
            />
          ) : null}
          <LinkRenderer config={{ id, routeId: config.viewAll.routeId }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: 12,
                fontWeight: 600,
                color: "surface.primarySoftFg",
              }}
            >
              {t(config.viewAll.label.name)}
              <IconRenderer name="arrow-forward" size={13} />
            </Box>
          </LinkRenderer>
        </Box>
      </Box>

      <ListRenderer
        id={id}
        config={{ variant: "inset", row: config.row, emptyText: config.emptyText }}
        data={data?.items ?? []}
        isLoading={isLoading}
      />
    </Card>
  );
}
