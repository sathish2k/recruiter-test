import type {
  LinkRendererConfig,
  StatCardRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

export interface CommissionsConfig {
  settingsRouteId: string;
  settingsLink: LinkRendererConfig;
  kpiCards: StatCardRendererConfig[];
  byMember: TableRendererConfig;
  placements: TableRendererConfig;
}

const ORANGE = "#FF9D57";
const GREEN = "#8FD6AC";
const AMBER = "#F0C27C";
const MUTED_ICON = "#7C7972";
const KPI_VALUE_SX = { fontSize: 26 };
const KPI_SUB_SX = { fontSize: 11.5, color: "text.disabled" };

const byMember: TableRendererConfig = {
  emptyLabel: "byMember.empty",
  columns: [
    {
      label: { name: "byMember.columns.member" },
      value: {
        type: "entity",
        shape: "circle",
        size: 32,
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "name",
        subtitle: "role",
      },
    },
    {
      label: { name: "byMember.columns.placements" },
      align: "right",
      value: { type: "text", path: "placements", sx: { fontWeight: 600 } },
    },
    {
      label: { name: "byMember.columns.commission" },
      align: "right",
      value: {
        type: "text",
        path: "commissionLabel",
        sx: { fontWeight: 600 },
      },
    },
    {
      label: { name: "byMember.columns.paid" },
      align: "right",
      value: { type: "text", path: "paidLabel", sx: { color: GREEN } },
    },
    {
      label: { name: "byMember.columns.pending" },
      align: "right",
      value: { type: "text", path: "pendingLabel", sx: { color: AMBER } },
    },
    {
      label: { name: "byMember.columns.payout" },
      align: "right",
      value: { type: "payout" },
    },
  ],
};

const placements: TableRendererConfig = {
  emptyLabel: "placements.empty",
  columns: [
    {
      label: { name: "placements.columns.candidate" },
      value: {
        type: "entity",
        shape: "circle",
        size: 32,
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "candidateName",
        subtitle: "placedWhen",
      },
    },
    {
      label: { name: "placements.columns.roleClient" },
      value: {
        type: "text",
        path: "roleClient",
        sx: { color: "text.secondary" },
      },
    },
    {
      label: { name: "placements.columns.fee" },
      align: "right",
      value: { type: "text", path: "feeLabel", sx: { fontWeight: 600 } },
    },
    {
      label: { name: "placements.columns.sourcer" },
      value: { type: "sourcerShare" },
    },
    {
      label: { name: "placements.columns.lead" },
      value: { type: "leadShare" },
    },
    {
      label: { name: "placements.columns.status" },
      align: "right",
      value: { type: "commissionStatus" },
    },
  ],
};

export const CommissionsConfiguration: CommissionsConfig = {
  settingsRouteId: "Recruit.Settings.Route",
  settingsLink: {
    routeId: "Recruit.Settings.Route",
    text: "footer.link",
    sx: { fontSize: 12, fontWeight: 600, color: ORANGE },
  },
  byMember,
  placements,
  kpiCards: [
    {
      variant: "accent",
      icon: { name: "payments", size: 16, color: ORANGE },
      label: { name: "kpis.total" },
      value: { type: "text", path: "totalLabel", sx: KPI_VALUE_SX },
      sub: { name: "kpis.totalSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "check-circle", size: 16, color: GREEN },
      label: { name: "kpis.paid" },
      value: {
        type: "text",
        path: "paidLabel",
        sx: { ...KPI_VALUE_SX, color: GREEN },
      },
      progress: {
        valuePath: "paidRaw",
        targetPath: "totalRaw",
        color: "linear-gradient(90deg,#8FD6AC,#4F9E76)",
        trackColor: "rgba(255,255,255,.08)",
      },
      sub: { name: "kpis.paidSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "hourglass", size: 16, color: AMBER },
      label: { name: "kpis.pending" },
      value: {
        type: "text",
        path: "pendingLabel",
        sx: { ...KPI_VALUE_SX, color: AMBER },
      },
      sub: { name: "kpis.pendingSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "certificate", size: 16, color: MUTED_ICON },
      label: { name: "kpis.topEarner" },
      value: {
        type: "entity",
        shape: "circle",
        size: 38,
        bgPath: "topEarnerBg",
        fgPath: "topEarnerFg",
        textPath: "topEarnerInitials",
        title: "topEarnerName",
        subtitle: "topEarnerAmountLabel",
      },
    },
  ],
};
