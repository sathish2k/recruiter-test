import { JobModel } from "../models/job.model";
import { UserModel } from "../models/user.model";

const PALETTE = [
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#3A5B4A", fg: "#CFF5E1" },
  { bg: "#5B4A3A", fg: "#F5E1CF" },
  { bg: "#4A5B3A", fg: "#E0F5CF" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
];

const DEFAULT_SWATCH = { bg: "#3A4A5B", fg: "#CFE3F5" };

const PERIOD_MULT: Record<string, number> = { today: 1, week: 5, month: 20 };

const initialsOf = (name: string) =>
  name
    .split(/[\s.]+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const firstNameOf = (name: string) => name.split(/[\s.]+/)[0] ?? name;

// ponytail: per-employee invite/connection/JD/CV/submitted counts aren't
// modelled, so derive seed-stable numbers deterministically from each active
// role's index (mirrors how the lead/employee dashboards split totals).
function roleCounts(index: number, mult: number) {
  const invites = 28 + ((index * 11) % 24);
  const connected = Math.round(invites * 0.55);
  const jds = Math.round(connected * 0.9);
  const cvs = Math.round(connected * 0.5);
  const submitted = Math.round(cvs * 0.6);
  const approved = Math.round(submitted * 0.65);
  return {
    invites: invites * mult,
    connected: connected * mult,
    jds: jds * mult,
    cvs: cvs * mult,
    submitted: submitted * mult,
    approved: approved * mult,
  };
}

export interface TeamActivityFilters {
  viewer?: string;
  role?: string;
  period?: string;
}

export interface EmployeeRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  rolesSub: string;
  invites: number;
  invitesTarget: number;
  connected: number;
  jds: number;
  cvs: number;
  submitted: number;
  approvalRate: number;
}

export interface RoleRow {
  id: string;
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
  invites: number;
  connected: number;
  cvs: number;
  submitted: number;
}

export interface TeamActivityData {
  viewer: string;
  role: string;
  period: string;
  periodLabel: string;
  leadView: boolean;
  leadName: string;
  leads: { id: string; name: string }[];
  roleOptions: string[];
  kpis: {
    invites: number;
    invitesTarget: number;
    connections: number;
    cvs: number;
    submitted: number;
    approval: number;
  };
  byEmployee: EmployeeRow[];
  byRole: RoleRow[];
}

export async function getTeamActivity(
  agencyId: string,
  filters: TeamActivityFilters = {},
): Promise<TeamActivityData> {
  const viewer = filters.viewer ?? "admin";
  const role = filters.role ?? "all";
  const period = PERIOD_MULT[filters.period ?? "today"]
    ? (filters.period as string)
    : "today";
  const mult = PERIOD_MULT[period] ?? 1;

  const [jobs, employees, leads] = await Promise.all([
    JobModel.find({ agencyId, status: "Active" }).sort({ postedTs: -1 }).lean(),
    UserModel.find({ agencyId, role: "employee", status: "active" })
      .select("name")
      .sort({ name: 1 })
      .lean(),
    UserModel.find({ agencyId, role: "lead", status: "active" })
      .select("name")
      .sort({ name: 1 })
      .lean(),
  ]);

  const empCount = Math.max(employees.length, 1);
  const leadCount = Math.max(leads.length, 1);

  const assigned = jobs.map((job, index) => {
    const employee = employees[index % empCount];
    const lead = leads[index % leadCount];
    const empName = employee?.name ?? "Unassigned";
    const leadName = lead?.name ?? "Unassigned";
    return {
      id: String((job as { _id: unknown })._id),
      title: job.title,
      client: job.client,
      empName,
      leadName,
      counts: roleCounts(index, mult),
    };
  });

  const leadView = viewer !== "admin";
  const scopedByViewer = leadView
    ? assigned.filter((row) => row.leadName === viewer)
    : assigned;
  const scoped =
    role === "all"
      ? scopedByViewer
      : scopedByViewer.filter((row) => row.title === role);

  const empSwatch = (name: string) => {
    const idx = employees.findIndex((employee) => employee.name === name);
    return PALETTE[(idx >= 0 ? idx : 0) % PALETTE.length] ?? DEFAULT_SWATCH;
  };
  const leadSwatch = (name: string) => {
    const idx = leads.findIndex((lead) => lead.name === name);
    return PALETTE[(idx >= 0 ? idx + 2 : 0) % PALETTE.length] ?? DEFAULT_SWATCH;
  };

  const byRole: RoleRow[] = scoped.map((row) => {
    const es = empSwatch(row.empName);
    const ls = leadSwatch(row.leadName);
    return {
      id: row.id,
      title: row.title,
      client: row.client,
      employeeName: firstNameOf(row.empName),
      employeeInitials: initialsOf(row.empName),
      employeeBg: es.bg,
      employeeFg: es.fg,
      leadName: firstNameOf(row.leadName),
      leadInitials: initialsOf(row.leadName),
      leadBg: ls.bg,
      leadFg: ls.fg,
      invites: row.counts.invites,
      connected: row.counts.connected,
      cvs: row.counts.cvs,
      submitted: row.counts.submitted,
    };
  });

  const byEmpMap = new Map<
    string,
    {
      clients: Set<string>;
      roles: number;
      invites: number;
      connected: number;
      jds: number;
      cvs: number;
      submitted: number;
      approved: number;
    }
  >();
  for (const row of scoped) {
    const acc = byEmpMap.get(row.empName) ?? {
      clients: new Set<string>(),
      roles: 0,
      invites: 0,
      connected: 0,
      jds: 0,
      cvs: 0,
      submitted: 0,
      approved: 0,
    };
    acc.clients.add(row.client);
    acc.roles += 1;
    acc.invites += row.counts.invites;
    acc.connected += row.counts.connected;
    acc.jds += row.counts.jds;
    acc.cvs += row.counts.cvs;
    acc.submitted += row.counts.submitted;
    acc.approved += row.counts.approved;
    byEmpMap.set(row.empName, acc);
  }

  const target = 50 * mult;
  const byEmployee: EmployeeRow[] = [...byEmpMap.entries()].map(
    ([name, acc]) => {
      const swatch = empSwatch(name);
      return {
        id: name,
        name,
        initials: initialsOf(name),
        avatarBg: swatch.bg,
        avatarFg: swatch.fg,
        rolesSub: `${acc.roles} roles · ${[...acc.clients].join(", ")}`,
        invites: acc.invites,
        invitesTarget: target,
        connected: acc.connected,
        jds: acc.jds,
        cvs: acc.cvs,
        submitted: acc.submitted,
        approvalRate:
          acc.submitted > 0
            ? Math.round((acc.approved / acc.submitted) * 100)
            : 0,
      };
    },
  );

  const sum = (key: keyof EmployeeRow) =>
    byEmployee.reduce((total, row) => total + Number(row[key] ?? 0), 0);
  const submittedTotal = sum("submitted");
  const approvedTotal = scoped.reduce(
    (total, row) => total + row.counts.approved,
    0,
  );

  const periodLabel =
    period === "week"
      ? "this week"
      : period === "month"
        ? "this month"
        : "today";

  return {
    viewer,
    role,
    period,
    periodLabel,
    leadView,
    leadName: leadView ? viewer : "",
    leads: leads.map((lead) => ({ id: lead.name, name: lead.name })),
    roleOptions: ["all", ...jobs.map((job) => job.title)],
    kpis: {
      invites: sum("invites"),
      invitesTarget: byEmployee.length * target,
      connections: sum("connected"),
      cvs: sum("cvs"),
      submitted: submittedTotal,
      approval:
        submittedTotal > 0
          ? Math.round((approvedTotal / submittedTotal) * 100)
          : 0,
    },
    byEmployee,
    byRole,
  };
}
