"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  FormModal,
  type FormValues,
  IconRenderer,
  Modal,
  TableRenderer,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo, useState } from "react";
import { CardHeader, Meter, SectionCard, StatTile } from "../ui";
import type { BillingConfig } from "./billing.configuration";

interface Invoice {
  id: string;
  number: string;
  status: string;
  [key: string]: unknown;
}

interface BillingData {
  plan: {
    key: string;
    name: string;
    status: string;
    price: string;
    monthly: string;
    seatTotal: number;
  };
  seats: {
    used: number;
    total: number;
    available: number;
    percent: number;
    extraSeatPrice: string;
  };
  usage: {
    creditsLabel: string;
    percent: number;
    resumeParsing: string;
    candidateMatches: string;
    emailsSent: string;
    storage: string;
  };
  payment: {
    brand: string;
    last4: string;
    expiry: string | null;
    email: string | null;
    renewsAt: string;
    billingName: string | null;
    gstin: string | null;
    address: string | null;
  };
  features: string[];
  invoices: Invoice[];
}

/** ✓ / ✗ used by both the plan-feature grid and the comparison table. */
function Tick({ on }: { on: boolean }) {
  return (
    <IconRenderer
      name={on ? "check-circle" : "cancel"}
      size={16}
      sx={{ color: on ? "var(--mui-palette-success-main)" : "rgba(255,255,255,.25)" }}
    />
  );
}

export function SettingsBillingComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<BillingConfig>(id);
  const { data, mutation, mutate } = useFetch<BillingData>(id);
  const { show } = useToast();
  const paymentModal = useModal();
  const [comparing, setComparing] = useState(false);

  const historyConfig = useMemo(() => {
    const columns = config.history.columns.map((column) =>
      column.value.type === "status" && "labels" in column.value
        ? {
            ...column,
            value: {
              ...column.value,
              labels: Object.fromEntries(
                Object.entries(column.value.labels ?? {}).map(([k, v]) => [k, t(v)]),
              ),
            },
          }
        : column,
    );
    return { ...config.history, columns };
  }, [config.history, t]);

  if (!data) return null;

  const changeSeats = async (delta: number) => {
    try {
      await mutation.changeSeats?.(delta);
      await mutate();
      show(
        delta > 0 ? t("toast.seatAdded") : t("toast.seatRemoved"),
        delta > 0 ? t("toast.seatAddedSub") : t("toast.seatRemovedSub"),
      );
    } catch {
      show(t("toast.seatsFull"), t("toast.seatsFullSub"));
    }
  };

  const changePlan = async (plan: string) => {
    await mutation.changePlan?.(plan);
    await mutate();
    setComparing(false);
    show(t("toast.planChanged"));
  };

  const savePayment = async (values: FormValues) => {
    await mutation.updatePayment?.(values);
    await mutate();
    show(t("toast.paymentSaved"));
  };

  const resets = new Date();
  resets.setMonth(resets.getMonth() + 1, 1);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.3fr 1fr" },
          gap: "16px",
        }}
      >
        {/* Current plan */}
        <Card
          variant="base"
          sx={{
            p: "20px 22px",
            borderRadius: "16px",
            background: (theme) => theme.gradients.planCard,
          }}
        >
          <Typography
            sx={{ fontSize: 10.5, fontWeight: 700, letterSpacing: ".09em", opacity: 0.75 }}
          >
            {t("plan.eyebrow")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", mt: "6px" }}>
            <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{data.plan.name}</Typography>
            <Chip variant="soft" size="small" color="success" label={t("plan.active")} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px", mt: "10px" }}>
            <Typography sx={{ fontSize: 24, fontWeight: 800 }}>{data.plan.price}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {t("plan.perYear")}
            </Typography>
          </Box>
          <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "6px" }}>
            {t("plan.summary", { monthly: data.plan.monthly, seats: data.plan.seatTotal })}
          </Typography>
          <Box sx={{ display: "flex", gap: "10px", mt: "16px" }}>
            <Button variant="contained" color="secondary" onClick={() => setComparing(true)}>
              {t("plan.change")}
            </Button>
            <Button variant="outlined" onClick={() => setComparing(true)}>
              {t("plan.compare")}
            </Button>
          </Box>
        </Card>

        {/* Seats */}
        <SectionCard>
          <CardHeader title={t("seats.title")} />
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <Typography sx={{ fontSize: 28, fontWeight: 800 }}>{data.seats.used}</Typography>
            <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
              {t("seats.used", { total: data.seats.total })}
            </Typography>
          </Box>
          <Box sx={{ mt: "10px" }}>
            <Meter percent={data.seats.percent} />
          </Box>
          <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "10px" }}>
            {t("seats.helper", {
              total: data.seats.total,
              used: data.seats.used,
              available: data.seats.available,
              price: data.seats.extraSeatPrice,
            })}
          </Typography>
          <Box sx={{ display: "flex", gap: "10px", mt: "14px" }}>
            <Button variant="outlined" sx={{ flex: 1 }} onClick={() => changeSeats(1)}>
              + {t("seats.add")}
            </Button>
            <Button variant="outlined" sx={{ flex: 1 }} onClick={() => changeSeats(-1)}>
              − {t("seats.remove")}
            </Button>
          </Box>
        </SectionCard>
      </Box>

      {/* Usage */}
      <SectionCard>
        <CardHeader
          title={t("usage.title")}
          action={
            <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
              {t("usage.resets", {
                date: resets.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
              })}
            </Typography>
          }
        />
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
        >
          <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{t("usage.credits")}</Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {data.usage.creditsLabel}
          </Typography>
        </Box>
        <Box sx={{ mt: "8px" }}>
          <Meter percent={data.usage.percent} />
        </Box>
        <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "8px" }}>
          {t("usage.creditsHelper", { percent: data.usage.percent })}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
            gap: "10px",
            mt: "16px",
          }}
        >
          {config.usageTiles.map((tile) => (
            <StatTile
              key={tile.key}
              label={t(tile.label)}
              value={String(data.usage[tile.key as keyof typeof data.usage] ?? "—")}
            />
          ))}
        </Box>
      </SectionCard>

      {/* Payment method */}
      <SectionCard>
        <CardHeader
          title={t("payment.title")}
          action={
            <Link component="button" onClick={() => paymentModal.open()} sx={{ fontSize: 12 }}>
              {t("payment.update")}
            </Link>
          }
        />
        <Box
          sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Card
              variant="inset"
              sx={{
                px: "12px",
                py: "8px",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: ".06em",
              }}
            >
              {data.payment.brand}
            </Card>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{data.payment.last4}</Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
                {[data.payment.expiry ? `Expires ${data.payment.expiry}` : null, data.payment.email]
                  .filter(Boolean)
                  .join(" · ") || "—"}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
              {t("payment.nextRenewal")}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{data.payment.renewsAt}</Typography>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            mt: "14px",
            pt: "14px",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
              {t("payment.billingAddress")}
            </Typography>
            <Typography sx={{ fontSize: 12.5, mt: "3px" }}>
              {[data.payment.billingName, data.payment.gstin ? `GSTIN ${data.payment.gstin}` : null]
                .filter(Boolean)
                .join(" · ") || "—"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {data.payment.address ?? "—"}
            </Typography>
          </Box>
          <Link component="button" onClick={() => paymentModal.open()} sx={{ fontSize: 12 }}>
            {t("payment.edit")}
          </Link>
        </Box>
      </SectionCard>

      {/* Billing history */}
      <SectionCard>
        <CardHeader title={t("history.title")} />
        <TableRenderer id={id} config={historyConfig} data={data.invoices} />
      </SectionCard>

      {/* Plan features */}
      <SectionCard>
        <CardHeader title={t("features.title")} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4,1fr)" },
            gap: "10px",
          }}
        >
          {config.featureKeys.map((key) => (
            <Box key={key} sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Tick on={data.features.includes(key)} />
              <Typography
                sx={{
                  fontSize: 12.5,
                  color: data.features.includes(key) ? "text.primary" : "text.disabled",
                }}
              >
                {t(`features.${key}`)}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            borderTop: "1px solid",
            borderColor: "divider",
            mt: "14px",
            pt: "14px",
          }}
        >
          <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
            {t("features.footer")}
          </Typography>
          <Link href="mailto:sales@hirepilotx.com" sx={{ fontSize: 12 }}>
            {t("features.contact")}
          </Link>
        </Box>
      </SectionCard>

      {/* Compare plans */}
      <Modal open={comparing} onClose={() => setComparing(false)} title={t("compare.title")}>
        <Box sx={{ overflowX: "auto" }}>
          <Box
            component="table"
            sx={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 460 }}
          >
            <Box component="thead">
              <Box component="tr">
                {[
                  t("compare.feature"),
                  t("compare.starter"),
                  `${t("compare.growth")} ${data.plan.key === "growth" ? t("compare.current") : ""}`,
                  t("compare.agency"),
                ].map((heading, index) => (
                  <Box
                    component="th"
                    key={heading}
                    sx={{
                      textAlign: index === 0 ? "left" : "center",
                      py: "9px",
                      fontSize: 11.5,
                      color: index === 2 ? "primary.main" : "text.disabled",
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    {heading}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {config.comparison.map((row) => (
                <Box component="tr" key={row.label}>
                  <Box
                    component="td"
                    sx={{ py: "9px", borderBottom: "1px solid", borderColor: "divider" }}
                  >
                    {t(row.label)}
                  </Box>
                  {(
                    [
                      ["starter", row.starter],
                      ["growth", row.growth],
                      ["agency", row.agency],
                    ] as [string, string | boolean][]
                  ).map(([plan, cell]) => (
                    <Box
                      component="td"
                      key={`${row.label}-${plan}`}
                      sx={{
                        py: "9px",
                        textAlign: "center",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      {typeof cell === "boolean" ? <Tick on={cell} /> : cell}
                    </Box>
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "12px" }}>
          {t("compare.footer")}
        </Typography>
        <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end", mt: "16px" }}>
          <Button variant="outlined" onClick={() => setComparing(false)}>
            {t("compare.close")}
          </Button>
          {config.plans
            .filter((plan) => plan.key !== data.plan.key)
            .map((plan) => (
              <Button key={plan.key} variant="contained" onClick={() => changePlan(plan.key)}>
                {t(plan.label)}
              </Button>
            ))}
        </Box>
      </Modal>

      <FormModal
        open={paymentModal.isOpen}
        onClose={paymentModal.close}
        id={id}
        title={t("paymentForm.title")}
        description={t("paymentForm.description")}
        schema={config.paymentForm}
        defaultValues={{
          paymentBrand: data.payment.brand === "—" ? "" : data.payment.brand,
          paymentExpiry: data.payment.expiry ?? "",
          billingEmail: data.payment.email ?? "",
          billingName: data.payment.billingName ?? "",
          gstin: data.payment.gstin ?? "",
          billingAddress: data.payment.address ?? "",
        }}
        submitLabel="paymentForm.submit"
        cancelLabel="cancel"
        onSubmit={savePayment}
      />
    </Box>
  );
}
