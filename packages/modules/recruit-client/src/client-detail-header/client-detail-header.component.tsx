"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { DetailHeaderRenderer, IconRenderer, SlaMeter } from "@recruit/shared";
import type { ClientDetailHeaderConfiguration } from "./client-detail-header.configuration";

interface ClientSla {
  pending: number;
  slaHours: number;
  elapsedHours: number;
  percent: number;
  breached: boolean;
}

interface Client {
  id: string;
  name: string;
  industry: string;
  accountLeadName: string;
  createdAt: string;
  sla: ClientSla | null;
}

/** The design's identity row plus the feedback-SLA hero strip under it. */
export function ClientDetailHeaderComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientDetailHeaderConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Client>(id, { filters: { id: params.id } });

  if (!config?.header) return null;

  const record = {
    ...(data ?? {}),
    subtitleLine: [
      data?.industry,
      data?.createdAt
        ? t("subtitle.since", {
            date: new Date(data.createdAt).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            }),
          })
        : "",
      data?.accountLeadName ? `${t("subtitle.accountLead")}: ${data.accountLeadName}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  } as Record<string, unknown>;

  const sla = data?.sla;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <DetailHeaderRenderer
        id={id}
        config={config.header}
        data={record}
        isLoading={isLoading || !data}
      />

      {/* The client is sitting on submitted CVs — how long, against the SLA. */}
      {sla && sla.pending > 0 ? (
        <Card
          variant="base"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            p: "18px 22px",
            background: (theme) =>
              `linear-gradient(120deg,${theme.palette.surface.heroTint},rgba(28,28,27,.75) 65%),${theme.palette.surface.paper}`,
            border: "1px solid",
            borderColor: "surface.heroBorder",
          }}
        >
          <Box
            sx={{
              width: 44,
              height: 44,
              flex: "none",
              display: "grid",
              placeItems: "center",
              borderRadius: "13px",
              bgcolor: "surface.primarySoftBg",
              border: "1px solid",
              borderColor: "surface.primarySoftBorder",
              color: "surface.accentBright",
            }}
          >
            <IconRenderer name={config.hero.icon} size={21} />
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 700, letterSpacing: "-.01em" }}>
              {t(config.hero.title.name, { count: sla.pending, name: data?.name ?? "" })}
            </Typography>
            <Box sx={{ mt: "6px" }}>
              <SlaMeter
                label={t(config.hero.slaLabel.name, { hours: sla.slaHours })}
                percent={sla.percent}
                trailing={t(config.hero.elapsedLabel.name, { hours: sla.elapsedHours })}
                breached={sla.breached}
              />
            </Box>
          </Box>

          <Button
            variant="contained"
            sx={{ flex: "none" }}
            endIcon={<IconRenderer name="arrow-forward" size={15} />}
            onClick={() =>
              document
                .querySelector("[data-client-submissions]")
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          >
            {t(config.hero.cta.name)}
          </Button>
        </Card>
      ) : null}
    </Box>
  );
}
