"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import delve from "dlv";
import type { JobDetailInfoConfiguration } from "./job-detail-info.configuration";

interface Info {
  status: string;
  periodLabel: string;
  dayOf: number;
  dayTotal: number;
  daysLeft: number;
  percent: number;
  [key: string]: unknown;
}

const STATUS_COLOR: Record<string, "success" | "warning" | "info" | "default"> = {
  open: "success",
  on_hold: "warning",
  filled: "info",
  closed: "default",
};

/** The rail's fact sheet: how far through the hiring window the requirement
 * is, then the six facts the design grids under it. */
export function JobDetailInfoComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<JobDetailInfoConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Info>(id, { filters: { id: params.id } });

  if (!config?.facts) return null;

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
            size="small"
            color={STATUS_COLOR[data.status] ?? "default"}
            label={t(`status.${data.status}`, data.status)}
          />
        ) : null}
      </Box>

      {isLoading || !data ? (
        <Skeleton variant="rounded" height={190} />
      ) : (
        <>
          {data.periodLabel ? (
            <>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  fontSize: 11.5,
                  color: "text.secondary",
                  mb: "7px",
                }}
              >
                <span>{t("period")}</span>
                <Box component="b" sx={{ color: "text.primary", fontSize: 12 }}>
                  {data.periodLabel}
                </Box>
              </Box>
              <Box
                sx={{
                  height: 5,
                  borderRadius: "999px",
                  bgcolor: "surface.track",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: `${data.percent}%`,
                    borderRadius: "999px",
                    background: "var(--mui-palette-primary-main)",
                  }}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 10.5,
                  color: "text.disabled",
                  mt: "6px",
                }}
              >
                <span>{t("dayOf", { day: data.dayOf, total: data.dayTotal })}</span>
                <span>{t("daysLeft", { count: data.daysLeft })}</span>
              </Box>
            </>
          ) : null}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
              mt: data.periodLabel ? "14px" : 0,
            }}
          >
            {config.facts.map((fact) => {
              const raw = delve(data as Record<string, unknown>, fact.path);
              const value = raw === undefined || raw === null || raw === "" ? "" : String(raw);
              return (
                <Box
                  key={fact.key}
                  sx={{
                    bgcolor: "surface.inset",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "11px",
                    p: "9px 12px",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      fontSize: 10.5,
                      color: "text.disabled",
                    }}
                  >
                    <IconRenderer name={fact.icon} size={13} />
                    {t(fact.label)}
                  </Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600, mt: "4px" }}>
                    {value
                      ? fact.translate
                        ? t(`${fact.translate}.${value}`, value)
                        : value
                      : "—"}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        </>
      )}
    </Card>
  );
}
