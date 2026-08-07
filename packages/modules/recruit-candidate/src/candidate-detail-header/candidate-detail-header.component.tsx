"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import { ActionsMenu, avatarSwatch, IconRenderer, initialsOf } from "@recruit/shared";
import type { CandidateDetailHeaderConfiguration } from "./candidate-detail-header.configuration";

interface Stage {
  id: string;
  name: string;
  state: "done" | "current" | "pending";
}

interface Summary {
  id: string;
  name: string;
  currentJobTitle: string;
  currentEmployer: string;
  experienceYears: string;
  location: string;
  status: string;
  availability: string;
  doNotContact: boolean;
  offLimits: boolean;
  matchScore: number;
  jobId: string;
  jobTitle: string;
  clientName: string;
  ownerName: string;
  stage: string;
  lastActivity: string;
  stages: Stage[];
}

const STATUS_COLOR: Record<string, "success" | "warning" | "info" | "primary" | "default"> = {
  new: "info",
  active: "warning",
  placed: "success",
  on_hold: "default",
  rejected: "default",
};

/**
 * The design's profile hero: the ring around the avatar is the match score, the
 * strip along the bottom is the workspace's own pipeline with the candidate's
 * stage marked, and the meta row underneath is who owns what.
 */
export function CandidateDetailHeaderComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateDetailHeaderConfiguration>(id);
  const params = useRouteParams();
  const router = usePortalRouter();
  const { data, isLoading } = useFetch<Summary>(id, { filters: { id: params.id } });

  if (isLoading || !data) return <Skeleton variant="rounded" height={230} />;

  const swatch = avatarSwatch(data.name);
  const score = Math.max(0, Math.min(100, data.matchScore));
  const meta = [
    [data.currentJobTitle, data.currentEmployer].filter(Boolean).join(" @ "),
    data.experienceYears ? t("meta.years", { count: data.experienceYears }) : "",
    data.location,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card
      variant="base"
      sx={{
        overflow: "hidden",
        background: (theme) =>
          `radial-gradient(130% 160% at 100% 0%,${theme.palette.surface.heroTint},rgba(28,28,27,.7) 55%),${theme.palette.surface.paper}`,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "16px",
          p: "18px 24px 15px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "18px", flex: 1, minWidth: 0 }}>
          {/* The ring is the score: a conic sweep, the remainder left dim. */}
          <Box sx={{ position: "relative", width: 78, height: 78, flex: "none" }}>
            <Box
              sx={{
                position: "absolute",
                inset: "-4px",
                borderRadius: "999px",
                background: (theme) =>
                  `conic-gradient(${theme.palette.primary.main} 0deg,${theme.palette.primary.main} ${(score / 100) * 360}deg,${theme.palette.surface.track} ${(score / 100) * 360}deg)`,
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: "-1px",
                borderRadius: "999px",
                bgcolor: "surface.paper",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: "2px",
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                bgcolor: swatch.bg,
                color: swatch.fg,
                fontSize: 22,
                fontWeight: 700,
              }}
            >
              {initialsOf(data.name)}
            </Box>
            {score > 0 ? (
              <Box
                sx={{
                  position: "absolute",
                  bottom: "-7px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "var(--mui-palette-primary-main)",
                  color: "#fff",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: "999px",
                  whiteSpace: "nowrap",
                }}
              >
                {`${score}%`}
              </Box>
            ) : null}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "11px", flexWrap: "wrap" }}>
              <Typography sx={{ fontSize: 23, fontWeight: 700, letterSpacing: "-.01em" }}>
                {data.name}
              </Typography>
              <Chip
                variant="soft"
                size="small"
                color={STATUS_COLOR[data.status] ?? "default"}
                label={t(`status.${data.status}`, data.status)}
              />
              {data.offLimits ? (
                <Chip variant="soft" size="small" color="error" label={t("chips.offLimits")} />
              ) : null}
              {data.doNotContact ? (
                <Chip variant="soft" size="small" color="warning" label={t("chips.doNotContact")} />
              ) : null}
            </Box>
            <Typography sx={{ fontSize: 13.5, color: "text.secondary", mt: "3px" }}>
              {meta}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
          <Button
            variant="contained"
            startIcon={<IconRenderer name="edit" size={16} />}
            onClick={() => router.push(config.editRouteId, { id: String(params.id ?? "") })}
          >
            {t("actions.edit")}
          </Button>
          <ActionsMenu id={id} actions={config.menuActions} data={data as never} />
        </Box>
      </Box>

      {/* Stage strip — the workspace's own pipeline, not a fixed list. */}
      <Box
        sx={{
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "surface.inset",
          p: "14px 24px 13px",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          {data.stages.map((stage, index) => (
            <Box
              key={stage.id}
              sx={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minWidth: 0,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Box
                  sx={{
                    flex: 1,
                    height: "2.5px",
                    bgcolor:
                      index === 0
                        ? "transparent"
                        : stage.state === "pending"
                          ? "surface.divider"
                          : "surface.successSoftBorder",
                  }}
                />
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    flex: "none",
                    borderRadius: "999px",
                    display: "grid",
                    placeItems: "center",
                    border: "2px solid",
                    boxSizing: "border-box",
                    borderColor:
                      stage.state === "done"
                        ? "surface.successSoftBorder"
                        : stage.state === "current"
                          ? "transparent"
                          : "surface.border",
                    bgcolor: stage.state === "done" ? "surface.successSoftBg" : "transparent",
                    background:
                      stage.state === "current" ? "var(--mui-palette-primary-main)" : undefined,
                    color: stage.state === "done" ? "surface.successFg" : "#fff",
                  }}
                >
                  {stage.state === "done" ? (
                    <IconRenderer name="check" size={13} />
                  ) : stage.state === "current" ? (
                    <IconRenderer name="hourglass" size={13} />
                  ) : null}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    height: "2.5px",
                    bgcolor:
                      index === data.stages.length - 1
                        ? "transparent"
                        : data.stages[index + 1]?.state === "pending"
                          ? "surface.divider"
                          : "surface.successSoftBorder",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 600,
                  mt: "8px",
                  textAlign: "center",
                  color: stage.state === "pending" ? "text.secondary" : "text.primary",
                }}
              >
                {stage.name}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "7px 22px",
            flexWrap: "wrap",
            mt: "12px",
            pt: "11px",
            borderTop: "1px solid",
            borderColor: "divider",
            fontSize: 11.5,
            color: "text.disabled",
          }}
        >
          {[
            { key: "owner", value: data.ownerName },
            { key: "client", value: data.clientName },
            { key: "requirement", value: data.jobTitle },
            { key: "lastActivity", value: data.lastActivity },
          ]
            .filter((entry) => entry.value)
            .map((entry) => (
              <Box component="span" key={entry.key}>
                {`${t(`meta.${entry.key}`)} `}
                <Box component="b" sx={{ color: "text.secondary" }}>
                  {entry.value}
                </Box>
              </Box>
            ))}
        </Box>
      </Box>
    </Card>
  );
}
