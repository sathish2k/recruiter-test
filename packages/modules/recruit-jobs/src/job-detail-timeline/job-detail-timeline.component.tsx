"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

type MilestoneState = "done" | "current" | "pending";

interface Milestone {
  key: string;
  when: string;
  state: MilestoneState;
}

interface Timeline {
  milestones: Milestone[];
  dayCount: number;
  stageLabel: string;
}

/** The rail's hiring timeline: one node per milestone, the reached ones filled,
 * the line between them tinted by what comes next. */
export function JobDetailTimelineComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Timeline>(id, { filters: { id: params.id } });

  const milestones = data?.milestones ?? [];

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          mb: "14px",
        }}
      >
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("title")}</Typography>
        {data ? (
          <Chip
            variant="soft"
            color="primary"
            size="small"
            label={t("day", {
              count: data.dayCount,
              stage: t(`milestones.${data.stageLabel}`, data.stageLabel),
            })}
          />
        ) : null}
      </Box>

      {isLoading ? (
        <Skeleton variant="rounded" height={180} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {milestones.map((milestone, index) => {
            const next = milestones[index + 1];
            return (
              <Box key={milestone.key} sx={{ display: "flex", gap: "12px" }}>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      flex: "none",
                      borderRadius: "999px",
                      display: "grid",
                      placeItems: "center",
                      border: "1.5px solid",
                      boxSizing: "border-box",
                      borderColor:
                        milestone.state === "done"
                          ? "surface.successSoftBorder"
                          : milestone.state === "current"
                            ? "transparent"
                            : "surface.border",
                      bgcolor: milestone.state === "done" ? "surface.successSoftBg" : "transparent",
                      background:
                        milestone.state === "current"
                          ? "var(--mui-palette-primary-main)"
                          : undefined,
                      color: milestone.state === "done" ? "surface.successFg" : "#fff",
                    }}
                  >
                    {milestone.state === "done" ? (
                      <IconRenderer name="check" size={12} />
                    ) : milestone.state === "current" ? (
                      <IconRenderer name="hourglass" size={12} />
                    ) : null}
                  </Box>
                  {next ? (
                    <Box
                      sx={{
                        width: 2,
                        flex: 1,
                        minHeight: 14,
                        borderRadius: "2px",
                        bgcolor:
                          next.state === "done" ? "surface.successSoftBorder" : "surface.divider",
                      }}
                    />
                  ) : null}
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: "8px",
                    pb: "13px",
                    pt: "2px",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: milestone.state === "pending" ? "text.secondary" : "text.primary",
                    }}
                  >
                    {t(`milestones.${milestone.key}`)}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled", flex: "none" }}>
                    {milestone.when || t("notYet")}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}
