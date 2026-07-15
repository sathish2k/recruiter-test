"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  type Cells,
  IconRenderer,
  StatCardRenderer,
  TableRenderer,
  Toast,
  useToast,
} from "@recruit/shared";
import { useState } from "react";
import type { TeamActivityConfig } from "./team-activity.configuration";

interface EmployeeRow {
  invites: number;
  invitesTarget: number;
  approvalRate: number;
}

interface RoleRow {
  title: string;
  client: string;
  employeeName: string;
  employeeInitials: string;
  employeeBg: string;
  employeeFg: string;
  leadName: string;
  leadInitials: string;
  leadBg: string;
  leadFg: string;
}

interface TeamActivityData {
  viewer: string;
  role: string;
  period: string;
  periodLabel: string;
  leadView: boolean;
  leadName: string;
  leads: { id: string; name: string }[];
  roleOptions: string[];
  kpis: Record<string, number>;
  byEmployee: Record<string, unknown>[];
  byRole: Record<string, unknown>[];
}

function MiniAvatar({
  initials,
  bg,
  fg,
}: {
  initials: string;
  bg: string;
  fg: string;
}) {
  return (
    <Box
      sx={{
        width: 24,
        height: 24,
        borderRadius: "999px",
        bgcolor: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 10,
        fontWeight: 600,
        flex: "none",
      }}
    >
      {initials}
    </Box>
  );
}

function TogglePill({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="outlined"
      onClick={onClick}
      startIcon={<IconRenderer name={icon} size={15} />}
    >
      {label}
    </Button>
  );
}

export function TeamActivityComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<TeamActivityConfig>(id);
  const { toast, show, clear } = useToast();

  const [viewer, setViewer] = useState("admin");
  const [role, setRole] = useState("all");
  const [period, setPeriod] = useState("today");

  const { data } = useFetch<TeamActivityData>(id, {
    filters: { viewer, role, period },
  });

  if (!data) return null;

  const viewerOptions = ["admin", ...data.leads.map((lead) => lead.id)];
  const cycleViewer = () => {
    const index = viewerOptions.indexOf(viewer);
    setViewer(viewerOptions[(index + 1) % viewerOptions.length] ?? "admin");
  };
  const cycleRole = () => {
    const index = data.roleOptions.indexOf(role);
    setRole(data.roleOptions[(index + 1) % data.roleOptions.length] ?? "all");
  };

  const viewerLabel =
    viewer === "admin"
      ? t("toolbar.adminView")
      : t("toolbar.leadView", { name: viewer });
  const roleLabel = role === "all" ? t("toolbar.allRoles") : role;

  const cells: Cells = {
    invitesBar: (row) => {
      const emp = row as unknown as EmployeeRow;
      const pct =
        emp.invitesTarget > 0
          ? Math.min(100, Math.round((emp.invites / emp.invitesTarget) * 100))
          : 0;
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
            {emp.invites} / {emp.invitesTarget}
          </Typography>
          <Box
            sx={{
              height: 5,
              borderRadius: "999px",
              background: "rgba(255,255,255,.08)",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                width: `${pct}%`,
                height: "100%",
                borderRadius: "999px",
                background: "linear-gradient(90deg,#FF8A3C,#C24509)",
              }}
            />
          </Box>
        </Box>
      );
    },
    approval: (row) => {
      const rate = Number((row as unknown as EmployeeRow).approvalRate);
      const color =
        rate >= 60 ? "#8FD6AC" : rate > 0 ? "#F0C27C" : "text.disabled";
      return (
        <Typography
          component="span"
          sx={{ fontSize: 13, fontWeight: 700, color }}
        >
          {rate > 0 ? `${rate}%` : "—"}
        </Typography>
      );
    },
    roleCell: (row) => {
      const item = row as unknown as RoleRow;
      return (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
            {item.title}
          </Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary" }} noWrap>
            {item.client}
          </Typography>
        </Box>
      );
    },
    empCell: (row) => {
      const item = row as unknown as RoleRow;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MiniAvatar
            initials={item.employeeInitials}
            bg={item.employeeBg}
            fg={item.employeeFg}
          />
          <Typography sx={{ fontSize: 12.5 }}>{item.employeeName}</Typography>
        </Box>
      );
    },
    leadCell: (row) => {
      const item = row as unknown as RoleRow;
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <MiniAvatar
            initials={item.leadInitials}
            bg={item.leadBg}
            fg={item.leadFg}
          />
          <Typography sx={{ fontSize: 12.5 }}>{item.leadName}</Typography>
        </Box>
      );
    },
  };

  const kpiData = { ...data.kpis, periodLabel: data.periodLabel };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <TogglePill
          icon={viewer === "admin" ? "shield-person" : "supervisor-account"}
          label={viewerLabel}
          onClick={cycleViewer}
        />
        <TogglePill icon="filter" label={roleLabel} onClick={cycleRole} />
        <Box sx={{ flex: 1 }} />
        <Tabs
          value={period}
          onChange={(_, next) => setPeriod(next)}
          aria-label={t("toolbar.period")}
        >
          <Tab value="today" label={t("toolbar.today")} />
          <Tab value="week" label={t("toolbar.week")} />
          <Tab value="month" label={t("toolbar.month")} />
        </Tabs>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => show(t("toast.csvTitle"), t("toast.csvSub"))}
          startIcon={<IconRenderer name="download" size={15} />}
        >
          {t("toolbar.export")}
        </Button>
      </Box>

      {data.leadView ? (
        <Card
          variant="highlight"
          sx={{ display: "flex", alignItems: "center", gap: "10px" }}
        >
          <IconRenderer name="supervisor-account" size={17} color="#FF9D57" />
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {t("banner", { name: data.leadName })}
          </Typography>
        </Card>
      ) : null}

      <StatCardRenderer
        id={id}
        config={config.kpiCards}
        data={kpiData}
        gridTemplateColumns="repeat(5, 1fr)"
        gap="16px"
      />

      <TableRenderer
        id={id}
        config={config.byEmployee}
        data={data.byEmployee}
        cells={cells}
      />
      <TableRenderer
        id={id}
        config={config.byRole}
        data={data.byRole}
        cells={cells}
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
