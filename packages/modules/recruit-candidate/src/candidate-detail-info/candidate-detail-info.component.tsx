"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import delve from "dlv";
import type { CandidateDetailInfoConfiguration } from "./candidate-detail-info.configuration";

/** The rail's Details card: contact, profile and the compliance rows, each an
 * icon and one line, as the design groups them. */
export function CandidateDetailInfoComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateDetailInfoConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Record<string, unknown>>(id, {
    filters: { id: params.id },
  });

  if (!config?.groups) return null;

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "14px" }}>{t("title")}</Typography>

      {isLoading || !data ? (
        <Skeleton variant="rounded" height={190} />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "11px" }}>
          {config.groups.map((group, groupIndex) => {
            const rows = group.rows
              .map((row) => ({
                ...row,
                value: row.paths
                  .map((path) => {
                    const raw = delve(data, path);
                    if (raw === undefined || raw === null || raw === "" || raw === false) return "";
                    if (raw === true) return t(`values.${path}`, path);
                    return row.translate
                      ? t(`${row.translate}.${String(raw)}`, String(raw))
                      : String(raw);
                  })
                  .filter(Boolean)
                  .join(" · "),
              }))
              .filter((row) => row.value);
            if (!rows.length) return null;

            return (
              <Box key={group.key} sx={{ display: "flex", flexDirection: "column", gap: "11px" }}>
                {groupIndex > 0 ? <Box sx={{ height: "1px", bgcolor: "divider" }} /> : null}
                <Typography
                  sx={{
                    fontSize: 10,
                    letterSpacing: ".1em",
                    fontWeight: 700,
                    color: "text.disabled",
                    mb: "-3px",
                  }}
                >
                  {t(`groups.${group.key}`)}
                </Typography>
                {rows.map((row) => (
                  <Box
                    key={row.key}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontSize: 12.5,
                      color: "text.secondary",
                    }}
                  >
                    <Box
                      sx={{
                        color: row.tone ? `surface.${row.tone}Fg` : "text.disabled",
                        display: "flex",
                        flex: "none",
                      }}
                    >
                      <IconRenderer name={row.icon} size={15} />
                    </Box>
                    {row.as === "email" || row.as === "phone" || row.as === "url" ? (
                      <Link
                        href={
                          row.as === "email"
                            ? `mailto:${row.value}`
                            : row.as === "phone"
                              ? `tel:${row.value.replace(/\s+/g, "")}`
                              : row.value.startsWith("http")
                                ? row.value
                                : `https://${row.value}`
                        }
                        sx={{ fontSize: 12.5, minWidth: 0, wordBreak: "break-word" }}
                      >
                        {row.value}
                      </Link>
                    ) : (
                      <Box sx={{ minWidth: 0, wordBreak: "break-word" }}>{row.value}</Box>
                    )}
                  </Box>
                ))}
              </Box>
            );
          })}
        </Box>
      )}
    </Card>
  );
}
