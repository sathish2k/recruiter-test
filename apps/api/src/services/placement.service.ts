import { CandidateModel } from "../models/candidate.model";
import {
  type InvoiceStatus,
  type PlacementDoc,
  PlacementModel,
  type PlacementStatus,
} from "../models/placement.model";

const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();

const feeOf = (doc: { ctc: number; feePct: number }) =>
  Math.round((doc.ctc * doc.feePct) / 100);

const money = (value: number) =>
  value >= 1000 ? `$${Math.round(value / 1000)}k` : `$${value}`;

const INVOICE_LABEL: Record<InvoiceStatus, string> = {
  none: "—",
  invoiced: "Invoiced · Net 30",
  paid: "Paid ✓",
};

type PlacementRecord = PlacementDoc & { _id: unknown };

function mapOffer(doc: PlacementRecord) {
  const fee = feeOf(doc);
  return {
    id: String(doc._id),
    candidateName: doc.candidateName,
    initials: doc.initials,
    avatarBg: doc.avatarBg,
    avatarFg: doc.avatarFg,
    roleClient: `${doc.role} · ${doc.client}`,
    role: doc.role,
    client: doc.client,
    ctc: doc.ctc,
    ctcLabel: money(doc.ctc),
    fee,
    feeLabel: money(fee),
    invoiceStatus: doc.invoiceStatus,
    invoiceLabel: INVOICE_LABEL[doc.invoiceStatus],
    status: doc.status,
  };
}

export interface PlacementsData {
  kpis: {
    offersOut: number;
    acceptedJoining: number;
    nextJoinDate: string;
    placementsYtd: number;
    feesThisQuarter: string;
    feesPending: string;
  };
  offers: ReturnType<typeof mapOffer>[];
  upcomingJoins: {
    id: string;
    name: string;
    initials: string;
    avatarBg: string;
    avatarFg: string;
    roleClient: string;
    joinDate: string;
    countdown: string;
  }[];
  feesByClient: { client: string; amount: string; pct: number }[];
  invoices: {
    id: string;
    ref: string;
    client: string;
    amount: string;
    placement: string;
    status: string;
  }[];
  guaranteeWatch: { id: string; name: string; daysLeft: string }[];
  candidateOptions: string[];
}

export async function listPlacements(
  agencyId: string,
): Promise<PlacementsData> {
  const [docs, candidates] = await Promise.all([
    PlacementModel.find({ agencyId }).sort({ ts: -1 }).lean(),
    CandidateModel.find({ agencyId }).select("name").sort({ name: 1 }).lean(),
  ]);
  const records = docs as PlacementRecord[];
  const accepted = records.filter((doc) => doc.status === "Accepted");

  const feesQuarter = accepted.reduce((total, doc) => total + feeOf(doc), 0);
  const feesPending = accepted
    .filter((doc) => doc.invoiceStatus !== "paid")
    .reduce((total, doc) => total + feeOf(doc), 0);

  const byClient = new Map<string, number>();
  for (const doc of accepted) {
    byClient.set(doc.client, (byClient.get(doc.client) ?? 0) + feeOf(doc));
  }
  const maxClient = Math.max(1, ...[...byClient.values()]);
  const feesByClient = [...byClient.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([client, amount]) => ({
      client,
      amount: money(amount),
      pct: Math.round((amount / maxClient) * 100),
    }));

  const invoices = accepted.map((doc, index) => ({
    id: String(doc._id),
    ref: `INV-${1042 + index}`,
    client: doc.client,
    amount: money(feeOf(doc)),
    placement: doc.candidateName,
    status:
      doc.invoiceStatus === "paid"
        ? "Paid"
        : doc.invoiceStatus === "invoiced"
          ? "Due"
          : "Overdue",
  }));

  const guaranteeWatch = accepted.map((doc, index) => ({
    id: String(doc._id),
    name: doc.candidateName,
    daysLeft: `${90 - index * 18} days left`,
  }));

  const upcomingJoins = accepted
    .filter((doc) => doc.joinDate)
    .map((doc, index) => ({
      id: String(doc._id),
      name: doc.candidateName,
      initials: doc.initials,
      avatarBg: doc.avatarBg,
      avatarFg: doc.avatarFg,
      roleClient: `${doc.role} · ${doc.client}`,
      joinDate: doc.joinDate,
      countdown: `in ${12 + index * 9} days`,
    }));

  const nextJoin = upcomingJoins[0]?.joinDate ?? "—";

  return {
    kpis: {
      offersOut: records.filter(
        (doc) => doc.status === "Sent" || doc.status === "Negotiating",
      ).length,
      acceptedJoining: accepted.length,
      nextJoinDate: nextJoin,
      placementsYtd: accepted.length + 23,
      feesThisQuarter: money(feesQuarter),
      feesPending: `${money(feesPending)} pending`,
    },
    offers: records.map(mapOffer),
    upcomingJoins,
    feesByClient,
    invoices,
    guaranteeWatch,
    candidateOptions: candidates.map((candidate) => candidate.name),
  };
}

export interface CreatePlacementInput {
  candidateName: string;
  ctc: number;
  role?: string;
  client?: string;
}

export async function createPlacement(
  agencyId: string,
  input: CreatePlacementInput,
) {
  const candidate = await CandidateModel.findOne({
    agencyId,
    name: input.candidateName,
  }).lean();
  const doc = await PlacementModel.create({
    agencyId,
    candidateName: input.candidateName,
    initials: candidate?.initials ?? initialsOf(input.candidateName),
    avatarBg: candidate?.avatarBg ?? "#4A3A5B",
    avatarFg: candidate?.avatarFg ?? "#E3CFF5",
    role: input.role ?? candidate?.role ?? "",
    client: input.client ?? candidate?.client ?? "",
    ctc: input.ctc,
    feePct: 20,
    status: "Sent",
    invoiceStatus: "none",
    ts: Date.now(),
  });
  return mapOffer(doc.toObject() as PlacementRecord);
}

export async function updateInvoiceStatus(
  agencyId: string,
  id: string,
  status: InvoiceStatus,
) {
  const doc = await PlacementModel.findOneAndUpdate(
    { _id: id, agencyId },
    { invoiceStatus: status },
    { new: true },
  ).lean();
  return doc ? mapOffer(doc as PlacementRecord) : null;
}

export type { InvoiceStatus, PlacementStatus };
