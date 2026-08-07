"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "@recruit/shared";
import type { Translate } from "./permissions.types";

export interface SummaryStat {
  key: string;
  value: number;
  unit: string;
  label: string;
  note: string;
  tone?: "default" | "warning" | "success";
}

const TONE = {
  default: "text.primary",
  warning: "surface.warningFg",
  success: "surface.successFg",
} as const;

/**
 * The plain-English readout of the matrix above it: what this role reaches,
 * what it can never see, and what it can destroy. Someone editing permissions
 * should not have to count ticks to answer those.
 */
export function PermissionSummary({
  roleLabel,
  stats,
  restricted,
  custom,
  memberCount,
  onDelete,
  t,
}: {
  roleLabel: string;
  stats: SummaryStat[];
  restricted: string[];
  custom: boolean;
  memberCount: string;
  onDelete: () => void;
  t: Translate;
}) {
  return (
    <Card
      variant="base"
      sx={{ p: "22px 24px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <Box>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t("summary.title")}</Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
          {t("summary.subtitle", { role: roleLabel })}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(178px,1fr))",
          gap: "12px",
        }}
      >
        {stats.map((stat) => (
          <Card key={stat.key} variant="inset" sx={{ p: "14px 16px" }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
              <Typography
                variant="h4"
                sx={{
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: "-.01em",
                  fontVariantNumeric: "tabular-nums",
                  color: TONE[stat.tone ?? "default"],
                }}
              >
                {stat.value}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{stat.unit}</Typography>
            </Box>
            <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: "text.primary", mt: "2px" }}>
              {stat.label}
            </Typography>
            <Typography sx={{ fontSize: 11, lineHeight: 1.5, color: "text.secondary", mt: "3px" }}>
              {stat.note}
            </Typography>
          </Card>
        ))}
      </Box>

      {restricted.length > 0 ? (
        <Card
          variant="inset"
          sx={{
            display: "flex",
            gap: "11px",
            fontSize: 12,
            lineHeight: 1.65,
            color: "text.secondary",
          }}
        >
          <IconRenderer name="block" size={18} sx={{ flex: "none", mt: "2px" }} />
          <Box>
            <Box component="b" sx={{ color: "text.primary" }}>
              {t("summary.noAccess")}
            </Box>{" "}
            {restricted.join(", ")}. {t("summary.noAccessBody")}
          </Box>
        </Card>
      ) : null}

      {custom ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            p: "14px 16px",
            borderRadius: "10px",
            bgcolor: "surface.errorSoftBg",
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: "11px",
              flex: 1,
              minWidth: 260,
              fontSize: 12,
              lineHeight: 1.6,
              color: "text.primary",
            }}
          >
            <IconRenderer
              name="delete-forever"
              size={18}
              sx={{ flex: "none", mt: "2px", color: "surface.errorFg" }}
            />
            <Box>{t("summary.deleteBand", { role: roleLabel, members: memberCount })}</Box>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={onDelete}
            startIcon={<IconRenderer name="delete" size={16} />}
            sx={{ flex: "none" }}
          >
            {t("summary.deleteRole")}
          </Button>
        </Box>
      ) : null}
    </Card>
  );
}
