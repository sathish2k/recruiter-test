"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import type { CandidateDetailActionsConfiguration } from "./candidate-detail-actions.configuration";

interface Action {
  key: string;
  tone: "urgent" | "warn" | "info";
  value?: string;
}

const TONE: Record<Action["tone"], string> = {
  urgent: "surface.errorFg",
  warn: "surface.warningFg",
  info: "surface.infoFg",
};

/**
 * The rail's next actions. Every row is a gap the record itself proves — a
 * missing CV, no consent on file, a stage already past its SLA — so the card
 * disappears when there is nothing to chase.
 */
export function CandidateDetailActionsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CandidateDetailActionsConfiguration>(id);
  const params = useRouteParams();
  const router = usePortalRouter();
  const { data, isLoading } = useFetch<{ actions: Action[] }>(id, { filters: { id: params.id } });

  if (isLoading) return <Skeleton variant="rounded" height={120} />;
  const actions = data?.actions ?? [];
  if (!actions.length) return null;

  return (
    <Card
      variant="base"
      sx={{ p: "18px 20px", border: "1px solid", borderColor: "surface.primarySoftBorder" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px" }}>
        <Box sx={{ color: "surface.primarySoftFg", display: "flex" }}>
          <IconRenderer name="sparkle" size={15} />
        </Box>
        <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("title")}</Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {actions.map((action) => (
          <Box
            key={action.key}
            component="button"
            type="button"
            onClick={() => router.push(config.editRouteId, { id: String(params.id ?? "") })}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              bgcolor: "surface.inset",
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "10px",
              p: "9px 12px",
              cursor: "pointer",
              color: "text.secondary",
              textAlign: "left",
              fontSize: 12.5,
              "&:hover": { borderColor: "surface.primarySoftBorder" },
            }}
          >
            <Box sx={{ color: TONE[action.tone], display: "flex", flex: "none" }}>
              <IconRenderer name={config.icons[action.key] ?? "info"} size={15} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {t(`actions.${action.key}`, { count: action.value ?? "" })}
            </Box>
            <Box sx={{ color: "text.disabled", display: "flex", flex: "none" }}>
              <IconRenderer name="arrow-forward" size={13} />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}
