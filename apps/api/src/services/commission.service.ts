import type { UserRole } from "@recruit/types";
import { PlacementModel } from "../models/placement.model";
import { UserModel } from "../models/user.model";

export type CommissionPeriod = "quarter" | "year";

const SOURCER_RATE = 0.07;
const LEAD_RATE = 0.05;

// Q3 2026 (Jul–Sep) is the demo quarter the design toggles against.
const QUARTER_MONTHS = [7, 8, 9];

const PALETTE = [
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#3A5B4A", fg: "#CFF5E1" },
  { bg: "#5B4A3A", fg: "#F5E1CF" },
  { bg: "#4A5B3A", fg: "#E0F5CF" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
];

const DEFAULT_SWATCH = { bg: "#3A4A5B", fg: "#CFE3F5" };

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Admin",
  lead: "Profile lead",
  employee: "Sourcer",
  client: "Client",
};

const initialsOf = (name: string) =>
  name
    .split(/[\s.]+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const usd = (value: number) => `$${Math.round(value).toLocaleString()}`;

const feeOf = (doc: { fee: number; ctc: number; feePct: number }) =>
  doc.fee > 0 ? doc.fee : Math.round((doc.ctc * doc.feePct) / 100);

interface MemberAcc {
  name: string;
  role: UserRole;
  placements: Set<string>;
  commission: number;
  paid: number;
  pending: number;
}

export interface CommissionMember {
  id: string;
  name: string;
  role: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  placements: number;
  commissionLabel: string;
  paidLabel: string;
  pendingLabel: string;
  payoutLabel: string;
  payoutTone: "paid" | "due";
}

export interface CommissionPlacement {
  id: string;
  candidateName: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  placedWhen: string;
  roleClient: string;
  feeLabel: string;
  sourcerName: string;
  sourcerAmtLabel: string;
  leadName: string;
  leadAmtLabel: string;
  commissionPaid: boolean;
  statusLabel: string;
}

export interface CommissionsData {
  period: CommissionPeriod;
  periodLabel: string;
  kpis: {
    totalLabel: string;
    totalRaw: number;
    placementCount: number;
    paidLabel: string;
    paidRaw: number;
    pct: number;
    pendingLabel: string;
    pendingCount: number;
    topEarnerName: string;
    topEarnerInitials: string;
    topEarnerBg: string;
    topEarnerFg: string;
    topEarnerAmountLabel: string;
  };
  members: CommissionMember[];
  placements: CommissionPlacement[];
}

export async function listCommissions(
  agencyId: string,
  period: CommissionPeriod,
): Promise<CommissionsData> {
  const [docs, users] = await Promise.all([
    PlacementModel.find({ agencyId, status: "Accepted", fee: { $gt: 0 } })
      .sort({ placedMonth: 1, ts: -1 })
      .lean(),
    UserModel.find({ agencyId }).select("name role").lean(),
  ]);

  const scoped =
    period === "quarter"
      ? docs.filter((doc) => QUARTER_MONTHS.includes(doc.placedMonth))
      : docs;

  const roleOf = new Map<string, UserRole>(
    users.map((user) => [user.name, user.role]),
  );
  const swatchIndex = new Map<string, number>();
  users
    .map((user) => user.name)
    .sort()
    .forEach((name, index) => {
      swatchIndex.set(name, index);
    });
  const swatchOf = (name: string) =>
    PALETTE[(swatchIndex.get(name) ?? 0) % PALETTE.length] ?? DEFAULT_SWATCH;

  const members = new Map<string, MemberAcc>();
  const touch = (name: string): MemberAcc => {
    const existing = members.get(name);
    if (existing) return existing;
    const acc: MemberAcc = {
      name,
      role: roleOf.get(name) ?? "employee",
      placements: new Set(),
      commission: 0,
      paid: 0,
      pending: 0,
    };
    members.set(name, acc);
    return acc;
  };

  let totalRaw = 0;
  let paidRaw = 0;
  let pendingCount = 0;

  const placements: CommissionPlacement[] = scoped.map((doc) => {
    const fee = feeOf(doc);
    const sourcerAmt = Math.round(fee * SOURCER_RATE);
    const leadAmt = Math.round(fee * LEAD_RATE);
    const paid = doc.commissionPaid;
    totalRaw += sourcerAmt + leadAmt;
    if (paid) paidRaw += sourcerAmt + leadAmt;
    else pendingCount += 1;

    const applyShare = (name: string, amount: number) => {
      if (!name) return;
      const acc = touch(name);
      acc.placements.add(String(doc._id));
      acc.commission += amount;
      if (paid) acc.paid += amount;
      else acc.pending += amount;
    };
    applyShare(doc.sourcer, sourcerAmt);
    applyShare(doc.lead, leadAmt);

    return {
      id: String(doc._id),
      candidateName: doc.candidateName,
      initials: doc.initials,
      avatarBg: doc.avatarBg,
      avatarFg: doc.avatarFg,
      placedWhen: `Placed ${doc.placedWhen}`,
      roleClient: `${doc.role} · ${doc.client}`,
      feeLabel: usd(fee),
      sourcerName: doc.sourcer,
      sourcerAmtLabel: usd(sourcerAmt),
      leadName: doc.lead,
      leadAmtLabel: usd(leadAmt),
      commissionPaid: paid,
      statusLabel: paid ? "Paid" : usd(sourcerAmt + leadAmt),
    };
  });

  const memberRows: CommissionMember[] = [...members.values()]
    .sort((a, b) => b.commission - a.commission)
    .map((acc) => {
      const swatch = swatchOf(acc.name);
      return {
        id: acc.name,
        name: acc.name,
        role: ROLE_LABEL[acc.role] ?? "Sourcer",
        initials: initialsOf(acc.name),
        avatarBg: swatch.bg,
        avatarFg: swatch.fg,
        placements: acc.placements.size,
        commissionLabel: usd(acc.commission),
        paidLabel: usd(acc.paid),
        pendingLabel: usd(acc.pending),
        payoutLabel: acc.pending === 0 ? "Paid" : `${usd(acc.pending)} due`,
        payoutTone: acc.pending === 0 ? "paid" : "due",
      };
    });

  const top = memberRows[0];

  return {
    period,
    periodLabel: period === "quarter" ? "Q3 2026 (Jul–Sep)" : "Jan–Dec 2026",
    kpis: {
      totalLabel: usd(totalRaw),
      totalRaw,
      placementCount: placements.length,
      paidLabel: usd(paidRaw),
      paidRaw,
      pct: totalRaw > 0 ? Math.round((paidRaw / totalRaw) * 100) : 0,
      pendingLabel: usd(totalRaw - paidRaw),
      pendingCount,
      topEarnerName: top?.name ?? "—",
      topEarnerInitials: top?.initials ?? "",
      topEarnerBg: top?.avatarBg ?? DEFAULT_SWATCH.bg,
      topEarnerFg: top?.avatarFg ?? DEFAULT_SWATCH.fg,
      topEarnerAmountLabel: top ? top.commissionLabel : "—",
    },
    members: memberRows,
    placements,
  };
}

export async function markCommissionPaid(
  agencyId: string,
  placementId: string,
) {
  const doc = await PlacementModel.findOneAndUpdate(
    { _id: placementId, agencyId },
    { commissionPaid: true },
    { new: true },
  ).lean();
  return doc
    ? { id: String(doc._id), commissionPaid: doc.commissionPaid }
    : null;
}
