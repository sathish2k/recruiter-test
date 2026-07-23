"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { IconRenderer, Slider, type WidgetProps } from "@recruit/shared";
import { type FieldValues, useFormContext } from "react-hook-form";

const MIN = 50;
const MAX = 95;
const clamp = (v: number) => Math.min(MAX, Math.max(MIN, v));

/** A 40×23 pill toggle matching the design (orange when on, white knob). */
function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <Box
      onClick={onClick}
      role="switch"
      aria-checked={on}
      sx={{
        width: 40,
        height: 23,
        flex: "none",
        borderRadius: "999px",
        cursor: "pointer",
        position: "relative",
        transition: "background .15s",
        bgcolor: on ? "#F26A1B" : "rgba(255,255,255,.14)",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "2.5px",
          left: on ? "19px" : "2.5px",
          width: 18,
          height: 18,
          borderRadius: "999px",
          bgcolor: "#fff",
          transition: "left .15s",
        }}
      />
    </Box>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "9px", fontSize: 13, color: "#C9C5BD" }}
      >
        <Box sx={{ color: "#9A968E", display: "flex", flex: "none" }}>
          <IconRenderer name={icon} size={16} />
        </Box>
        {label}
      </Box>
      {children}
    </Box>
  );
}

/**
 * The AI Screening side card — a bespoke accent panel (its section is `bare`).
 * The widget's own `field` is the master enable (`aiScreening`); the threshold
 * and the sub-toggles are sibling form fields it reads/writes via context, so
 * they persist and submit with the rest of the form.
 */
export function AiScreeningWidget({ field, t }: WidgetProps) {
  const { watch, setValue } = useFormContext<FieldValues>();
  const enabled = Boolean(field.value);
  const threshold = clamp(Number(watch("matchThreshold") ?? 80));
  const autoAdvance = Boolean(watch("autoAdvance"));
  const knockout = Number(watch("knockoutCount") ?? 4);
  const dailyDigest = Boolean(watch("dailyDigest"));
  // Rough "for similar roles" estimate: a lower bar admits more candidates.
  const estMatches = Math.max(2, Math.round((100 - threshold) * 0.85));

  return (
    <Box
      sx={{
        bgcolor: "surface.paper",
        border: "1px solid",
        borderColor: "surface.primarySoftBorder",
        borderRadius: "16px",
        overflow: "hidden",
      }}
    >
      {/* Header — badge + title/subtitle + master toggle */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "11px",
          p: "16px 20px",
          background: "linear-gradient(120deg,rgba(242,106,27,.3),rgba(242,106,27,.06))",
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            flex: "none",
            borderRadius: "10px",
            background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconRenderer name="sparkle" size={18} />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
            {t("fields.aiScreening")}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "#D9B79A" }}>
            {t("fields.aiScreeningHelp")}
          </Typography>
        </Box>
        <Toggle on={enabled} onClick={() => field.onChange(!enabled)} />
      </Box>

      {enabled ? (
        <Box sx={{ p: "18px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Match threshold — shared slider widget */}
          <Slider
            label={t("fields.matchThreshold")}
            value={threshold}
            onChange={(v) => setValue("matchThreshold", v, { shouldDirty: true })}
            min={MIN}
            max={MAX}
            step={5}
            suffix="%"
            minLabel={t("fields.thresholdBroad")}
            maxLabel={t("fields.thresholdStrict")}
          />

          {/* Weekly estimate */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "11px",
              bgcolor: "surface.primarySoftBg",
              border: "1px solid",
              borderColor: "surface.primarySoftBorder",
              borderRadius: "11px",
              p: "11px 14px",
            }}
          >
            <Box sx={{ color: "surface.accentBright", display: "flex", flex: "none" }}>
              <IconRenderer name="insights" size={17} />
            </Box>
            <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: "#E8C4A6" }}>
              ≈{" "}
              <Box component="b" sx={{ color: "text.primary" }}>
                {estMatches} {t("fields.estMatchesUnit")}
              </Box>{" "}
              {t("fields.estMatchesSuffix")}
            </Typography>
          </Box>

          {/* Sub-toggles */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Row icon="move-up" label={t("fields.autoAdvance")}>
              <Toggle
                on={autoAdvance}
                onClick={() => setValue("autoAdvance", !autoAdvance, { shouldDirty: true })}
              />
            </Row>
            <Row icon="quiz" label={t("fields.knockout")}>
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{knockout}</Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: "surface.primarySoftFg" }}>
                  {t("fields.knockoutEdit")}
                </Typography>
              </Box>
            </Row>
            <Row icon="notifications" label={t("fields.dailyDigest")}>
              <Toggle
                on={dailyDigest}
                onClick={() => setValue("dailyDigest", !dailyDigest, { shouldDirty: true })}
              />
            </Row>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
