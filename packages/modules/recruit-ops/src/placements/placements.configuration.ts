import type {
  JsonSchema,
  StatCardRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

export interface PlacementsConfig {
  candidateRouteId: string;
  kpiCards: StatCardRendererConfig[];
  offers: TableRendererConfig;
  addForm: JsonSchema;
}

const ORANGE = "#FF9D57";
const GREEN = "#8FD6AC";
const MUTED_ICON = "#7C7972";
const KPI_VALUE_SX = { fontSize: 26 };
const KPI_SUB_SX = { fontSize: 11.5, color: "text.disabled" };

const offers: TableRendererConfig = {
  emptyLabel: "offers.empty",
  columns: [
    {
      label: { name: "offers.columns.candidate" },
      value: {
        type: "entity",
        shape: "circle",
        size: 30,
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "candidateName",
      },
    },
    {
      label: { name: "offers.columns.roleClient" },
      value: {
        type: "text",
        path: "roleClient",
        sx: { color: "text.secondary" },
      },
    },
    {
      label: { name: "offers.columns.ctc" },
      align: "right",
      value: { type: "text", path: "ctcLabel", sx: { fontWeight: 600 } },
    },
    {
      label: { name: "offers.columns.fee" },
      align: "right",
      value: {
        type: "text",
        path: "feeLabel",
        sx: { color: ORANGE, fontWeight: 600 },
      },
    },
    { label: { name: "offers.columns.invoice" }, value: { type: "invoice" } },
    {
      label: { name: "offers.columns.status" },
      value: {
        type: "status",
        path: "status",
        variant: "soft",
        labels: {
          Sent: "statuses.sent",
          Accepted: "statuses.accepted",
          Negotiating: "statuses.negotiating",
          Declined: "statuses.declined",
        },
        colors: {
          Sent: "warning",
          Accepted: "success",
          Negotiating: "info",
          Declined: "error",
        },
      },
    },
  ],
};

const addForm: JsonSchema = {
  type: "object",
  properties: {
    candidateName: {
      type: "string",
      title: "addForm.candidate",
      enum: [],
    },
    ctc: {
      type: "string",
      title: "addForm.ctc",
      placeholder: "addForm.ctcPlaceholder",
      icon: "payments",
      help: "addForm.ctcHelp",
    },
  },
  required: ["candidateName", "ctc"],
  errorMessage: {
    required: {
      candidateName: "addForm.candidateRequired",
      ctc: "addForm.ctcRequired",
    },
  },
};

export const PlacementsConfiguration: PlacementsConfig = {
  candidateRouteId: "Recruit.CandidateDetail.Route",
  offers,
  addForm,
  kpiCards: [
    {
      icon: { name: "contract", size: 16, color: MUTED_ICON },
      label: { name: "kpis.offersOut" },
      value: { type: "number", path: "offersOut", sx: KPI_VALUE_SX },
      sub: { name: "kpis.offersOutSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "check-circle", size: 16, color: GREEN },
      label: { name: "kpis.acceptedJoining" },
      value: {
        type: "number",
        path: "acceptedJoining",
        sx: { ...KPI_VALUE_SX, color: GREEN },
      },
      sub: { name: "kpis.acceptedJoiningSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "handshake", size: 16, color: MUTED_ICON },
      label: { name: "kpis.placementsYtd" },
      value: { type: "number", path: "placementsYtd", sx: KPI_VALUE_SX },
      sub: { name: "kpis.placementsYtdSub", sx: KPI_SUB_SX },
    },
    {
      variant: "accent",
      icon: { name: "payments", size: 16, color: ORANGE },
      label: { name: "kpis.feesThisQuarter" },
      value: { type: "text", path: "feesThisQuarter", sx: KPI_VALUE_SX },
      sub: { name: "kpis.feesThisQuarterSub", sx: KPI_SUB_SX },
    },
  ],
};
