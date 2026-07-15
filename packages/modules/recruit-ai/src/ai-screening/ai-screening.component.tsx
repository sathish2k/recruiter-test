"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import { IconRenderer, LinkRenderer, Toast, useToast } from "@recruit/shared";
import { useEffect, useState } from "react";
import type { AiScreeningConfig } from "./ai-screening.configuration";

interface RecentScreening {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
  score: number;
  verdict: string;
  when: string;
}

interface ScreeningData {
  kpis: {
    cvsScoredToday: number;
    avgMatch: number;
    aboveThreshold: number;
    timeSaved: string | number;
  };
  recent: RecentScreening[];
  distribution: { label: string; pct: number; color: string }[];
  perRoleThresholds: {
    id: string;
    title: string;
    client: string;
    threshold: number;
  }[];
  settings: { threshold: number; autoScore: boolean; autoForward: boolean };
}

type Translate = (key: string, vars?: Record<string, unknown>) => string;

function scoreColor(score: number): string {
  if (score >= 80) return "success.light";
  if (score >= 60) return "warning.light";
  return "text.disabled";
}

function KpiCard({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  icon: string;
  accent?: boolean;
}) {
  return (
    <Card
      variant={accent ? "accent" : "base"}
      sx={{ display: "flex", flexDirection: "column", gap: "10px" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {label}
        </Typography>
        <IconRenderer
          name={icon}
          size={16}
          color={accent ? "#FF9D57" : "#7C7972"}
        />
      </Box>
      <Typography
        sx={{ fontSize: 27, fontWeight: 700, letterSpacing: "-.01em" }}
      >
        {value}
      </Typography>
      <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
        {sub}
      </Typography>
    </Card>
  );
}

function RecentScreenings({
  rows,
  config,
  t,
}: {
  rows: RecentScreening[];
  config: AiScreeningConfig;
  t: Translate;
}) {
  return (
    <Card variant="base">
      <Box sx={{ mb: "14px" }}>
        <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
          {t("recent.title")}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "2px" }}>
          {t("recent.subtitle")}
        </Typography>
      </Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t("recent.columns.candidate")}</TableCell>
            <TableCell>{t("recent.columns.roleClient")}</TableCell>
            <TableCell sx={{ width: 160 }}>
              {t("recent.columns.score")}
            </TableCell>
            <TableCell>{t("recent.columns.verdict")}</TableCell>
            <TableCell>{t("recent.columns.when")}</TableCell>
            <TableCell align="right">{t("recent.columns.report")}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Avatar
                    sx={{
                      width: 30,
                      height: 30,
                      fontSize: 11.5,
                      fontWeight: 600,
                      bgcolor: row.avatarBg,
                      color: row.avatarFg,
                    }}
                  >
                    {row.initials}
                  </Avatar>
                  <Typography sx={{ fontSize: 13.5, fontWeight: 600 }} noWrap>
                    {row.name}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>
                {row.roleClient}
              </TableCell>
              <TableCell>
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <Typography sx={{ fontSize: 13, fontWeight: 700, width: 34 }}>
                    {row.score}%
                  </Typography>
                  <Box
                    sx={{
                      flex: 1,
                      height: 6,
                      borderRadius: "999px",
                      bgcolor: "rgba(255,255,255,.08)",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        width: `${row.score}%`,
                        height: "100%",
                        borderRadius: "999px",
                        bgcolor: scoreColor(row.score),
                      }}
                    />
                  </Box>
                </Box>
              </TableCell>
              <TableCell>
                <Chip
                  variant="soft"
                  color={config.verdictStyles[row.verdict] ?? "default"}
                  label={t(`verdicts.${row.verdict}`)}
                />
              </TableCell>
              <TableCell sx={{ color: "text.secondary" }}>{row.when}</TableCell>
              <TableCell align="right">
                <LinkRenderer
                  config={{
                    routeId: config.reportRouteId,
                    params: { id: { type: "dynamic", path: "id" } },
                    text: t("recent.report"),
                    color: "primary",
                    sx: { fontSize: 12.5, fontWeight: 600 },
                  }}
                  data={row as unknown as Record<string, unknown>}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

function SettingsCard({
  threshold,
  autoScore,
  autoForward,
  onThreshold,
  onAutoScore,
  onAutoForward,
  t,
}: {
  threshold: number;
  autoScore: boolean;
  autoForward: boolean;
  onThreshold: (next: number) => void;
  onAutoScore: (next: boolean) => void;
  onAutoForward: (next: boolean) => void;
  t: Translate;
}) {
  return (
    <Card
      variant="highlight"
      sx={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
        <IconRenderer name="tune" size={17} color="#FF9D57" />
        <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
          {t("settings.title")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
            {t("settings.threshold")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <IconButton
              onClick={() => onThreshold(threshold - 5)}
              aria-label={t("settings.threshold")}
            >
              <IconRenderer name="remove" size={15} />
            </IconButton>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 700,
                width: 42,
                textAlign: "center",
              }}
            >
              {threshold}%
            </Typography>
            <IconButton
              color="primary"
              onClick={() => onThreshold(threshold + 5)}
              aria-label={t("settings.threshold")}
            >
              <IconRenderer name="add" size={15} />
            </IconButton>
          </Box>
        </Box>
        <Box
          sx={{
            position: "relative",
            height: 8,
            borderRadius: "999px",
            background: "linear-gradient(90deg,#B9A18C,#F26A1B)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: `${threshold}%`,
              width: 16,
              height: 16,
              borderRadius: "50%",
              bgcolor: "#fff",
              border: "3px solid #F26A1B",
              transform: "translate(-50%,-50%)",
            }}
          />
        </Box>
        <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
          {t("settings.thresholdHint")}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: 13 }}>{t("settings.autoScore")}</Typography>
        <Switch
          checked={autoScore}
          onChange={(e) => onAutoScore(e.target.checked)}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ fontSize: 13 }}>
          {t("settings.autoForward")}
        </Typography>
        <Switch
          checked={autoForward}
          onChange={(e) => onAutoForward(e.target.checked)}
        />
      </Box>
    </Card>
  );
}

export function AiScreeningComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AiScreeningConfig>(id);
  const router = usePortalRouter();
  const { toast, show, clear } = useToast();
  const { data, mutate, mutation } = useFetch<ScreeningData>(id);

  const [threshold, setThreshold] = useState(80);
  const [autoScore, setAutoScore] = useState(true);
  const [autoForward, setAutoForward] = useState(true);

  useEffect(() => {
    if (!data?.settings) return;
    setThreshold(data.settings.threshold);
    setAutoScore(data.settings.autoScore);
    setAutoForward(data.settings.autoForward);
  }, [data?.settings]);

  if (!data) return null;

  const persist = async (patch: Record<string, unknown>) => {
    await mutation.update?.(patch);
    await mutate();
    show(t("toast.savedTitle"), t("toast.savedSub"));
  };

  const changeThreshold = (next: number) => {
    const clamped = Math.max(0, Math.min(100, next));
    setThreshold(clamped);
    void persist({ threshold: clamped });
  };
  const changeAutoScore = (next: boolean) => {
    setAutoScore(next);
    void persist({ autoScore: next });
  };
  const changeAutoForward = (next: boolean) => {
    setAutoForward(next);
    void persist({ autoForward: next });
  };

  const kpiValue = (key: string): string => {
    const raw = data.kpis[key as keyof ScreeningData["kpis"]];
    const kpi = config.kpis.find((k) => k.key === key);
    return `${raw ?? "—"}${kpi?.suffix ?? ""}`;
  };

  return (
    <Box sx={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {config.kpis.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={t(kpi.label)}
              value={kpiValue(kpi.key)}
              sub={t(`kpis.${kpi.key}Sub`)}
              icon={kpi.icon}
              accent={kpi.accent}
            />
          ))}
        </Box>
        <RecentScreenings rows={data.recent} config={config} t={t} />
      </Box>

      <Box
        sx={{
          width: 350,
          flex: "0 0 350px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <SettingsCard
          threshold={threshold}
          autoScore={autoScore}
          autoForward={autoForward}
          onThreshold={changeThreshold}
          onAutoScore={changeAutoScore}
          onAutoForward={changeAutoForward}
          t={t}
        />

        <Card variant="base">
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            {t("perRole.title")}
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: "text.secondary",
              mt: "2px",
              mb: "12px",
            }}
          >
            {t("perRole.subtitle")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {data.perRoleThresholds.length === 0 ? (
              <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>
                {t("perRole.empty")}
              </Typography>
            ) : (
              data.perRoleThresholds.map((role) => (
                <Box
                  key={role.id}
                  onClick={() =>
                    router.push(config.jobRouteId, { id: role.id })
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "10px",
                    p: "9px 10px",
                    borderRadius: "9px",
                    cursor: "pointer",
                    "&:hover": { background: "rgba(255,255,255,.05)" },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                      {role.title}
                    </Typography>
                    <Typography
                      sx={{ fontSize: 11.5, color: "text.secondary" }}
                      noWrap
                    >
                      {role.client}
                    </Typography>
                  </Box>
                  <Chip
                    variant="soft"
                    color="primary"
                    label={`${role.threshold}%`}
                  />
                </Box>
              ))
            )}
          </Box>
        </Card>

        <Card variant="base">
          <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>
            {t("distribution.title")}
          </Typography>
          <Typography
            sx={{
              fontSize: 12.5,
              color: "text.secondary",
              mt: "2px",
              mb: "14px",
            }}
          >
            {t("distribution.subtitle")}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: "4px",
              height: 10,
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            {data.distribution.map((d) => (
              <Box
                key={d.label}
                sx={{ width: `${d.pct}%`, background: d.color }}
              />
            ))}
          </Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px 14px",
              mt: "14px",
            }}
          >
            {data.distribution.map((d) => (
              <Box
                key={d.label}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  fontSize: 12.5,
                  color: "text.secondary",
                }}
              >
                <Box
                  sx={{
                    width: 9,
                    height: 9,
                    borderRadius: "2px",
                    background: d.color,
                    flex: "none",
                  }}
                />
                {d.label} ({d.pct}%)
              </Box>
            ))}
          </Box>
        </Card>

        <Card variant="base">
          <Typography sx={{ fontSize: 14.5, fontWeight: 600, mb: "12px" }}>
            {t("scores.title")}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {config.scoreItems.map((item) => (
              <Box
                key={item.label}
                sx={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Box
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(242,106,27,.12)",
                    flex: "none",
                  }}
                >
                  <IconRenderer name={item.icon} size={15} color="#FF9D57" />
                </Box>
                <Typography sx={{ fontSize: 13 }}>{t(item.label)}</Typography>
                <Box sx={{ flex: 1 }} />
                <IconRenderer name="check" size={16} color="#8FD6AC" />
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
