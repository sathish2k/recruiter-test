"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  type Cells,
  FormModal,
  type FormValues,
  IconRenderer,
  StatCardRenderer,
  TableRenderer,
  Toast,
  useModal,
  useToast,
} from "@recruit/shared";
import type { PlacementsConfig } from "./placements.configuration";

interface JoinRow {
  id: string;
  name: string;
  initials: string;
  avatarBg: string;
  avatarFg: string;
  roleClient: string;
  joinDate: string;
  countdown: string;
}

interface FeeRow {
  client: string;
  amount: string;
  pct: number;
}

interface InvoiceRow {
  id: string;
  ref: string;
  client: string;
  amount: string;
  placement: string;
  status: string;
}

interface GuaranteeRow {
  id: string;
  name: string;
  daysLeft: string;
}

interface PlacementsData {
  kpis: Record<string, unknown>;
  offers: Record<string, unknown>[];
  upcomingJoins: JoinRow[];
  feesByClient: FeeRow[];
  invoices: InvoiceRow[];
  guaranteeWatch: GuaranteeRow[];
  candidateOptions: string[];
}

type Translate = (key: string, vars?: Record<string, unknown>) => string;

const INVOICE_NEXT: Record<string, string> = {
  none: "invoiced",
  invoiced: "paid",
  paid: "none",
};

const INVOICE_COLOR: Record<string, string> = {
  none: "#7C7972",
  invoiced: "#F0C27C",
  paid: "#8FD6AC",
};

const INVOICE_STATUS_COLOR: Record<string, "error" | "warning" | "success"> = {
  Overdue: "error",
  Due: "warning",
  Paid: "success",
};

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
        width: 34,
        height: 34,
        borderRadius: "999px",
        bgcolor: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 12,
        fontWeight: 600,
        flex: "none",
      }}
    >
      {initials}
    </Box>
  );
}

function UpcomingJoins({ rows, t }: { rows: JoinRow[]; t: Translate }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
        {t("joins.title")}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
        }}
      >
        {rows.map((row) => (
          <Card
            key={row.id}
            variant="inset"
            sx={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <MiniAvatar
              initials={row.initials}
              bg={row.avatarBg}
              fg={row.avatarFg}
            />
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }} noWrap>
                {row.name}
              </Typography>
              <Typography
                sx={{ fontSize: 11.5, color: "text.secondary" }}
                noWrap
              >
                {row.roleClient}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography
                sx={{ fontSize: 12, fontWeight: 700, color: "#FFD9BC" }}
              >
                {t("joins.joins", { date: row.joinDate })}
              </Typography>
              <Chip variant="soft" color="primary" label={row.countdown} />
            </Box>
          </Card>
        ))}
      </Box>
      <Card
        variant="highlight"
        sx={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <IconRenderer name="verified-user" size={17} color="#FF9D57" />
        <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
          {t("joins.guaranteeBanner")}
        </Typography>
      </Card>
    </Box>
  );
}

function FeesByClient({ rows, t }: { rows: FeeRow[]; t: Translate }) {
  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "14px" }}>
        {t("rail.feesTitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {rows.map((row) => (
          <Box key={row.client}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: "5px",
              }}
            >
              <Typography sx={{ fontSize: 12.5 }}>{row.client}</Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                {row.amount}
              </Typography>
            </Box>
            <Box
              sx={{
                height: 6,
                borderRadius: "999px",
                background: "rgba(255,255,255,.08)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${row.pct}%`,
                  height: "100%",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg,#FF8A3C,#C24509)",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

function Invoices({
  rows,
  t,
  onRemind,
}: {
  rows: InvoiceRow[];
  t: Translate;
  onRemind: () => void;
}) {
  const overdue = rows.some((row) => row.status === "Overdue");
  return (
    <Card variant="base">
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "12px" }}>
        {t("rail.invoicesTitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "9px" }}>
        {rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "10px",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 600 }} noWrap>
                {row.ref} · {row.client}
              </Typography>
              <Typography
                sx={{ fontSize: 11.5, color: "text.disabled" }}
                noWrap
              >
                {row.amount} · {row.placement}
              </Typography>
            </Box>
            <Chip
              variant="soft"
              color={INVOICE_STATUS_COLOR[row.status] ?? "default"}
              label={row.status}
            />
          </Box>
        ))}
      </Box>
      {overdue ? (
        <Button
          variant="outlined"
          onClick={onRemind}
          startIcon={<IconRenderer name="notifications-active" size={15} />}
          sx={{ mt: "14px", width: "100%" }}
        >
          {t("rail.sendReminder")}
        </Button>
      ) : null}
    </Card>
  );
}

function GuaranteeWatch({ rows, t }: { rows: GuaranteeRow[]; t: Translate }) {
  return (
    <Card variant="base" sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "12px" }}>
        {t("rail.guaranteeTitle")}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {rows.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
              {row.name}
            </Typography>
            <Chip variant="soft" color="warning" label={row.daysLeft} />
          </Box>
        ))}
      </Box>
    </Card>
  );
}

export function PlacementsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<PlacementsConfig>(id);
  const { toast, show, clear } = useToast();
  const addModal = useModal();
  const { data, mutate, mutation } = useFetch<PlacementsData>(id);

  if (!data) return null;

  const cycleInvoice = async (rowId: string, current: string) => {
    const next = INVOICE_NEXT[current] ?? "invoiced";
    await mutation.updateInvoice?.(rowId, next);
    await mutate();
  };

  const createOffer = async (values: FormValues) => {
    await mutation.create?.({
      candidateName: values.candidateName,
      ctc: Number(values.ctc),
    });
    await mutate();
    show(t("toast.savedTitle"), t("toast.savedSub"));
  };

  const cells: Cells = {
    invoice: (row) => {
      const status = String(row.invoiceStatus);
      return (
        <Box
          component="span"
          onClick={() => cycleInvoice(String(row.id), status)}
          sx={{
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            color: INVOICE_COLOR[status] ?? "text.secondary",
            "&:hover": { opacity: 0.8 },
          }}
        >
          {String(row.invoiceLabel)}
        </Box>
      );
    },
  };

  const addSchema = {
    ...config.addForm,
    properties: {
      ...config.addForm.properties,
      candidateName: {
        ...config.addForm.properties?.candidateName,
        enum: data.candidateOptions,
      },
    },
  };

  return (
    <Box sx={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <StatCardRenderer
          id={id}
          config={config.kpiCards}
          data={data.kpis}
          gap="16px"
        />

        <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>
              {t("offers.title")}
            </Typography>
            <Button
              variant="contained"
              onClick={() => addModal.open()}
              startIcon={<IconRenderer name="add" size={15} />}
            >
              {t("offers.record")}
            </Button>
          </Box>
          <TableRenderer
            id={id}
            config={config.offers}
            data={data.offers}
            cells={cells}
          />
        </Box>

        <UpcomingJoins rows={data.upcomingJoins} t={t} />
      </Box>

      <Box
        sx={{
          width: 350,
          flex: "0 0 350px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <FeesByClient rows={data.feesByClient} t={t} />
        <Invoices
          rows={data.invoices}
          t={t}
          onRemind={() => show(t("toast.remindTitle"), t("toast.remindSub"))}
        />
        <GuaranteeWatch rows={data.guaranteeWatch} t={t} />
      </Box>

      <FormModal
        open={addModal.isOpen}
        onClose={addModal.close}
        id={id}
        title={t("addForm.title")}
        description={t("addForm.description")}
        schema={addSchema}
        submitLabel="addForm.submit"
        cancelLabel="cancel"
        onSubmit={createOffer}
      />

      <Toast toast={toast} onClose={clear} />
    </Box>
  );
}
