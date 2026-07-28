"use client";

import Box from "@mui/material/Box";
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
import { avatarSwatch, IconRenderer } from "@recruit/shared";
import type { CandidateDetailAssignmentConfiguration } from "./candidate-detail-assignment.configuration";

interface Assignment {
  jobId: string;
  jobTitle: string;
  clientId: string;
  clientName: string;
  workModel: string;
  employmentType: string;
  stage: string;
  stageDays: number;
  slaDays: number;
  slaOverBy: number;
  ownerName: string;
}

/** The rail's current-assignment card: the requirement this candidate is on,
 * how long they have sat in the stage, and who owns it. */
export function CandidateDetailAssignmentComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateDetailAssignmentConfiguration>(id);
  const params = useRouteParams();
  const router = usePortalRouter();
  const { data, isLoading } = useFetch<Assignment>(id, { filters: { id: params.id } });

  if (isLoading) return <Skeleton variant="rounded" height={160} />;
  if (!data?.jobId) return null;

  const swatch = avatarSwatch(data.clientName || data.jobTitle);

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "12px" }}>{t("title")}</Typography>

      <Box
        component="button"
        type="button"
        onClick={() => router.push(config.requirementRouteId, { id: data.jobId })}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          bgcolor: "surface.inset",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "12px",
          p: "12px 14px",
          cursor: "pointer",
          color: "inherit",
          textAlign: "left",
          "&:hover": { borderColor: "surface.primarySoftBorder" },
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            flex: "none",
            borderRadius: "10px",
            display: "grid",
            placeItems: "center",
            bgcolor: swatch.bg,
            color: swatch.fg,
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          {(data.clientName || data.jobTitle || "?").slice(0, 1).toUpperCase()}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{data.jobTitle}</Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
            {[
              data.clientName,
              data.workModel ? t(`workModels.${data.workModel}`, data.workModel) : "",
              data.employmentType
                ? t(`employmentType.${data.employmentType}`, data.employmentType)
                : "",
            ]
              .filter(Boolean)
              .join(" · ")}
          </Typography>
        </Box>
        <Box sx={{ color: "text.disabled", display: "flex" }}>
          <IconRenderer name="chevron-right" size={16} />
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          fontSize: 12,
          color: "text.secondary",
          borderTop: "1px solid",
          borderColor: "divider",
          mt: "12px",
          pt: "12px",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>{t("stage")}</span>
          <Box sx={{ display: "flex", alignItems: "center", gap: "7px" }}>
            <Box component="b" sx={{ color: "text.primary" }}>
              {t("stageValue", { stage: data.stage || "—", days: data.stageDays })}
            </Box>
            {data.slaOverBy ? (
              <Chip
                variant="soft"
                size="small"
                color="error"
                label={t("slaOver", { count: data.slaOverBy })}
              />
            ) : null}
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <span>{t("owner")}</span>
          <Box component="b" sx={{ color: "text.primary" }}>
            {data.ownerName || "—"}
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
