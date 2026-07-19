"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import { FieldLabel, IconRenderer } from "@recruit/shared";
import { useState } from "react";
import type { EditJobPanelConfig } from "./edit-job.configuration";

const rowSx = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "9px",
};

function MultiSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <FieldLabel label={label} />
      <TextField
        select
        fullWidth
        hiddenLabel
        value={value}
        onChange={(e) => {
          const next = e.target.value as unknown;
          onChange(
            Array.isArray(next) ? (next as string[]) : String(next).split(","),
          );
        }}
        slotProps={{
          select: {
            multiple: true,
            renderValue: (selected) => (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(selected as string[]).map((name) => (
                  <Chip key={name} variant="soft" size="small" label={name} />
                ))}
              </Box>
            ),
          },
        }}
      >
        {options.map((name) => (
          <MenuItem key={name} value={name}>
            <Checkbox
              size="small"
              checked={value.includes(name)}
              sx={{ p: 0 }}
            />
            {name}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}

export function EditJobPanel({
  id,
  config,
  screening,
  onScreeningChange,
  threshold,
  onThresholdChange,
  autoAdvance,
  onAutoAdvanceChange,
  digest,
  onDigestChange,
}: {
  id: string;
  config: EditJobPanelConfig;
  screening: boolean;
  onScreeningChange: (value: boolean) => void;
  threshold: number;
  onThresholdChange: (value: number) => void;
  autoAdvance: boolean;
  onAutoAdvanceChange: (value: boolean) => void;
  digest: boolean;
  onDigestChange: (value: boolean) => void;
}) {
  const { t } = useTranslation(id);
  // ponytail: team, leads and channels stay UI-only until assignment lands.
  const [employees, setEmployees] = useState<string[]>(
    config.team[0] ? [config.team[0]] : [],
  );
  const [leads, setLeads] = useState<string[]>(
    config.leads[0] ? [config.leads[0]] : [],
  );
  const [channels, setChannels] = useState<Record<string, boolean>>(
    Object.fromEntries(config.channels.map((c) => [c.key, c.on])),
  );
  const markerLeft = `${(((threshold - 50) / 45) * 100).toFixed(1)}%`;
  const estimate = Math.max(4, Math.round((95 - threshold) * 1.1));

  return (
    <>
      <Card
        sx={{ p: 0, overflow: "hidden", borderColor: "rgba(242,106,27,.35)" }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            p: "16px 20px",
            background:
              "linear-gradient(120deg,rgba(242,106,27,.3),rgba(242,106,27,.06))",
          }}
        >
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
              color: "#fff",
            }}
          >
            <IconRenderer name="sparkle" size={18} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
              {t("panel.screening")}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "#D9B79A" }}>
              {t("panel.screeningHint")}
            </Typography>
          </Box>
          <Switch
            checked={screening}
            onChange={(e) => onScreeningChange(e.target.checked)}
          />
        </Box>
        <Box
          sx={{
            p: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <Box>
            <Box sx={{ ...rowSx, alignItems: "baseline", mb: "10px" }}>
              <Typography sx={{ fontSize: 13, color: "#C9C5BD" }}>
                {t("panel.threshold")}
              </Typography>
              <Typography
                sx={{ fontSize: 19, fontWeight: 700, color: "#FF9D57" }}
              >
                {threshold}%
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <IconButton
                sx={{ width: 26, height: 26 }}
                onClick={() => onThresholdChange(Math.max(50, threshold - 5))}
              >
                −
              </IconButton>
              <Box
                sx={{
                  flex: 1,
                  position: "relative",
                  height: 22,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 8,
                    borderRadius: "999px",
                    background:
                      "linear-gradient(90deg,#3A3A38,#B9805A,#F26A1B)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: markerLeft,
                    transform: "translateX(-50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "999px",
                    background: "#fff",
                    border: "3px solid #F26A1B",
                    boxShadow: "0 2px 8px rgba(0,0,0,.5)",
                  }}
                />
              </Box>
              <IconButton
                sx={{ width: 26, height: 26 }}
                onClick={() => onThresholdChange(Math.min(95, threshold + 5))}
              >
                +
              </IconButton>
            </Box>
            <Box
              sx={{
                ...rowSx,
                fontSize: 11,
                color: "text.disabled",
                mt: "6px",
                px: "36px",
              }}
            >
              <span>{t("panel.broad")}</span>
              <span>{t("panel.strict")}</span>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                background: "rgba(242,106,27,.1)",
                border: "1px solid rgba(242,106,27,.25)",
                borderRadius: "11px",
                p: "11px 14px",
                mt: "12px",
              }}
            >
              <IconRenderer name="monitoring" size={17} color="#FF9D57" />
              <Typography
                sx={{ fontSize: 12, lineHeight: 1.5, color: "#E8C4A6" }}
              >
                {t("panel.estimate", { count: estimate })}
              </Typography>
            </Box>
          </Box>
          <Box sx={rowSx}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                fontSize: 13,
                color: "#C9C5BD",
              }}
            >
              <IconRenderer name="move-up" size={16} color="#9A968E" />
              {t("panel.autoAdvance")}
            </Box>
            <Switch
              checked={autoAdvance}
              onChange={(e) => onAutoAdvanceChange(e.target.checked)}
            />
          </Box>
          <Box sx={rowSx}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                fontSize: 13,
                color: "#C9C5BD",
              }}
            >
              <IconRenderer name="quiz" size={16} color="#9A968E" />
              {t("panel.knockout")}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>4</Typography>
              <Typography
                sx={{ fontSize: 12, fontWeight: 600, color: "#F0B27C" }}
              >
                {t("panel.edit")}
              </Typography>
            </Box>
          </Box>
          <Box sx={rowSx}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                fontSize: 13,
                color: "#C9C5BD",
              }}
            >
              <IconRenderer name="notifications" size={16} color="#9A968E" />
              {t("panel.digest")}
            </Box>
            <Switch
              checked={digest}
              onChange={(e) => onDigestChange(e.target.checked)}
            />
          </Box>
        </Box>
      </Card>

      <Card variant="base">
        <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
          {t("panel.team")}
        </Typography>
        <Typography
          sx={{ fontSize: 12, color: "text.disabled", mb: "14px", mt: "4px" }}
        >
          {t("panel.teamHint")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <MultiSelect
            label={t("panel.employee")}
            options={config.team}
            value={employees}
            onChange={setEmployees}
          />
          <MultiSelect
            label={t("panel.lead")}
            options={config.leads}
            value={leads}
            onChange={setLeads}
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
            <FieldLabel label={t("panel.inviteTarget")} />
            <TextField fullWidth hiddenLabel placeholder="50" />
          </Box>
        </Box>
      </Card>

      <Card variant="base">
        <Typography sx={{ fontSize: 14.5, fontWeight: 600, mb: "8px" }}>
          {t("panel.publishTo")}
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {config.channels.map((channel) => (
            <FormControlLabel
              key={channel.key}
              control={
                <Checkbox
                  checked={channels[channel.key] ?? false}
                  onChange={(e) =>
                    setChannels((prev) => ({
                      ...prev,
                      [channel.key]: e.target.checked,
                    }))
                  }
                />
              }
              label={t(channel.label)}
              slotProps={{ typography: { sx: { fontSize: 13 } } }}
            />
          ))}
        </Box>
      </Card>
    </>
  );
}
