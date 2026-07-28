"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";

interface Assessment {
  score: number;
  hasScore: boolean;
  jobId: string;
  jobTitle: string;
  coverage: number;
  matched: string[];
  missing: string[];
  recommendation: "proceed" | "review" | "gap";
}

const TONE: Record<Assessment["recommendation"], "success" | "warning" | "error"> = {
  proceed: "success",
  review: "warning",
  gap: "error",
};

/**
 * The design's AI assessment card. The headline score is what the screener
 * stored; the breakdown under it is computed from the requirement's must-have
 * skills against this candidate's — the one comparison the data supports.
 */
export function CandidateDetailAssessmentComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Assessment>(id, { filters: { id: params.id } });

  if (isLoading) return <Skeleton variant="rounded" height={180} />;
  // Nothing to assess against until the candidate is on a requirement.
  if (!data?.jobId) return null;

  const tone = TONE[data.recommendation];

  return (
    <Card variant="base" sx={{ p: "22px 24px" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
        <Box sx={{ color: "surface.primarySoftFg", display: "flex" }}>
          <IconRenderer name="psychology" size={20} />
        </Box>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("title")}</Typography>
        <Typography sx={{ fontSize: 12, color: "text.disabled", minWidth: 0 }}>
          {t("against", { role: data.jobTitle })}
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: "-.02em",
            lineHeight: 1,
            color: "surface.primarySoftFg",
          }}
        >
          {data.hasScore ? `${data.score}%` : `${data.coverage}%`}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
          rowGap: "10px",
          mt: "14px",
          p: "11px 15px",
          borderRadius: "12px",
          border: "1px solid",
          borderColor: `surface.${tone}SoftBorder`,
          bgcolor: `surface.${tone}SoftBg`,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <Typography
            sx={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".1em",
              color: "text.disabled",
              mb: "4px",
            }}
          >
            {t("recommendation")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: 14,
              fontWeight: 700,
              color: `surface.${tone}Fg`,
            }}
          >
            <IconRenderer
              name={data.recommendation === "proceed" ? "check-circle" : "info"}
              size={16}
            />
            {t(`recommendations.${data.recommendation}`)}
          </Box>
        </Box>
        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
          {t("coverage", {
            matched: data.matched.length,
            total: data.matched.length + data.missing.length,
          })}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", mt: "16px" }}>
        {(
          [
            { key: "matched", values: data.matched, color: "success" as const },
            { key: "missing", values: data.missing, color: "warning" as const },
          ] as const
        )
          .filter((group) => group.values.length)
          .map((group) => (
            <Box key={group.key}>
              <Typography
                sx={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: ".1em",
                  color: "text.disabled",
                  mb: "7px",
                }}
              >
                {t(`groups.${group.key}`)}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {group.values.map((skill) => (
                  <Chip key={skill} variant="soft" size="small" color={group.color} label={skill} />
                ))}
              </Box>
            </Box>
          ))}
      </Box>
    </Card>
  );
}
