"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import {
  ActionsMenu,
  EntityRenderer,
  IconRenderer,
  LinkRenderer,
  StatusRenderer,
} from "@recruit/shared";
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

/** The design's identity row: logo tile, name with its state chips inline, the
 * meta line, then the action row and overflow menu. */
export function ClientDetailHeaderComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientDetailHeaderConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Client>(id, { filters: { id: params.id } });

  if (!config?.header) return null;

  // The identity block is the page title — showing an empty tile and a blank
  // name while it loads reads as broken, so it holds its shape instead.
  if (isLoading || !data) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "15px", minWidth: 0 }}>
          <Skeleton variant="rounded" width={56} height={56} sx={{ borderRadius: "16px" }} />
          <Box>
            <Skeleton variant="text" width={220} height={30} />
            <Skeleton variant="text" width={300} height={18} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
          <Skeleton variant="rounded" width={132} height={38} sx={{ borderRadius: "999px" }} />
          <Skeleton variant="rounded" width={150} height={38} sx={{ borderRadius: "999px" }} />
          <Skeleton variant="rounded" width={158} height={38} sx={{ borderRadius: "999px" }} />
        </Box>
      </Box>
    );
  }

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
            minWidth: 0,
            flex: "1 1 auto",
          }}
        >
          <EntityRenderer
            config={config.header.entity}
            data={record}
            titleAdornment={
              <>
                <StatusRenderer config={config.header.status} data={record} />
                <StatusRenderer config={config.header.health} data={record} />
              </>
            }
          />
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flex: "none" }}>
          {config.headerActions.map((action) => (
            <LinkRenderer key={action.type} config={{ id, ...action }} data={record}>
              <Button
                variant="outlined"
                startIcon={action.icon ? <IconRenderer name={action.icon} size={15} /> : undefined}
              >
                {t(action.label?.name ?? "")}
              </Button>
            </LinkRenderer>
          ))}
          <LinkRenderer config={{ id, ...config.primaryAction }} data={record}>
            <Button
              variant="contained"
              startIcon={
                config.primaryAction.icon ? (
                  <IconRenderer name={config.primaryAction.icon} size={15} />
                ) : undefined
              }
            >
              {t(config.primaryAction.label?.name ?? "")}
            </Button>
          </LinkRenderer>
          <ActionsMenu id={id} actions={config.menuActions} data={record} />
        </Box>
      </Box>

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
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px", mt: "6px" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, color: "surface.kicker" }}>
                {t(config.hero.slaLabel.name, { hours: sla.slaHours })}
              </Typography>
              <Box
                sx={{
                  width: 120,
                  height: 5,
                  flex: "none",
                  borderRadius: "999px",
                  overflow: "hidden",
                  bgcolor: "surface.track",
                }}
              >
                <Box
                  sx={{
                    width: `${sla.percent}%`,
                    height: "100%",
                    borderRadius: "999px",
                    bgcolor: sla.breached ? "error.main" : "surface.accentBright",
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: 11, fontWeight: 600, color: "surface.textSecondary" }}>
                {t(config.hero.elapsedLabel.name, { hours: sla.elapsedHours })}
              </Typography>
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
