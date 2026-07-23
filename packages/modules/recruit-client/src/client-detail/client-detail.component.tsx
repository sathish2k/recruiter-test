"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useFetch, usePortalRouter, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer, ListSection, type ListSectionItem } from "@recruit/shared";
import type { ReactNode } from "react";

interface ClientAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface Client {
  id: string;
  name: string;
  industry: string;
  website: string;
  phone: string;
  billingEmail: string;
  address: ClientAddress | null;
  accountLeadName: string;
  source: string;
  feeBasis: string;
  feeValue: string;
  paymentTerms: string;
  taxId: string;
  notes: string;
  status: string;
  health: string;
  openRoles: number;
  candidates: number;
  placements: number;
}

const HEALTH_FG: Record<string, string> = {
  healthy: "surface.successFg",
  attention: "surface.warningFg",
  at_risk: "surface.accentBright",
  dormant: "surface.textSecondary",
};

const LIST_ROUTE = "Recruit.Clients.Route";
const EDIT_ROUTE = "Recruit.ClientEdit.Route";

function valueNode(value?: string): ReactNode {
  return (
    <Typography sx={{ fontSize: 12.5, color: value ? "text.primary" : "text.disabled" }}>
      {value || "—"}
    </Typography>
  );
}

export function ClientDetailComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const params = useRouteParams();
  const clientId = params.id;
  const { data, isLoading } = useFetch<Client>(id, { filters: { id: clientId } });

  const client = data;
  const health = client?.health ?? "healthy";
  const healthFg = HEALTH_FG[health] ?? "surface.textSecondary";
  const isHiring = (client?.status ?? "hiring") === "hiring";

  const addr = client?.address ?? {};
  const addressLine = [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
    .filter(Boolean)
    .join(", ");

  const about: ListSectionItem[] = [
    { key: "industry", title: t("labels.industry"), action: valueNode(client?.industry) },
    { key: "website", title: t("labels.website"), action: valueNode(client?.website) },
    { key: "phone", title: t("labels.phone"), action: valueNode(client?.phone) },
    { key: "lead", title: t("labels.accountLead"), action: valueNode(client?.accountLeadName) },
    {
      key: "source",
      title: t("labels.source"),
      action: valueNode(client?.source ? t(`source.${client.source}`, client.source) : ""),
    },
    { key: "address", title: t("labels.address"), action: valueNode(addressLine) },
  ];

  const fee: ListSectionItem[] = [
    {
      key: "feeBasis",
      title: t("labels.feeBasis"),
      action: valueNode(client?.feeBasis ? t(`feeBasis.${client.feeBasis}`) : ""),
    },
    { key: "feeValue", title: t("labels.feeValue"), action: valueNode(client?.feeValue) },
    {
      key: "paymentTerms",
      title: t("labels.paymentTerms"),
      action: valueNode(
        client?.paymentTerms
          ? t(`paymentTermsOptions.${client.paymentTerms}`, client.paymentTerms)
          : "",
      ),
    },
    {
      key: "billingEmail",
      title: t("labels.billingEmail"),
      action: valueNode(client?.billingEmail),
    },
    { key: "taxId", title: t("labels.taxId"), action: valueNode(client?.taxId) },
  ];

  const metrics: { key: string; label: string; value: number; accent?: boolean }[] = [
    { key: "req", label: t("metrics.requirements"), value: client?.openRoles ?? 0 },
    { key: "cand", label: t("metrics.candidates"), value: client?.candidates ?? 0 },
    { key: "plac", label: t("metrics.placements"), value: client?.placements ?? 0, accent: true },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: 900 }}>
      <Link
        component="button"
        type="button"
        onClick={() => router.push(LIST_ROUTE)}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          fontSize: 12.5,
          fontWeight: 600,
          color: "text.secondary",
          alignSelf: "flex-start",
        }}
      >
        <IconRenderer name="arrow-back" size={15} />
        {t("back")}
      </Link>

      {/* Header */}
      <Card variant="base" sx={{ p: "22px", display: "flex", alignItems: "center", gap: "16px" }}>
        <Avatar
          sx={{
            width: 54,
            height: 54,
            fontSize: 20,
            fontWeight: 700,
            bgcolor: "#3A4A5B",
            color: "#CFE3F5",
          }}
        >
          {(client?.name ?? "?").charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <Typography sx={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.01em" }}>
              {client?.name ?? (isLoading ? "…" : "—")}
            </Typography>
            <Box
              sx={{
                fontSize: 10,
                fontWeight: 700,
                px: "8px",
                py: "2px",
                borderRadius: "999px",
                border: "1px solid",
                color: isHiring ? "surface.successFg" : "text.muted",
                bgcolor: isHiring ? "surface.successSoftBg" : "surface.tint",
                borderColor: isHiring ? "surface.successSoftBorder" : "surface.borderStrong",
              }}
            >
              {t(`status.${client?.status ?? "hiring"}`)}
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: 11,
                fontWeight: 600,
                color: healthFg,
              }}
            >
              <Box sx={{ width: 5, height: 5, borderRadius: "999px", bgcolor: healthFg }} />
              {t(`health.${health}`)}
            </Box>
          </Box>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", mt: "3px" }}>
            {[client?.industry, client?.website].filter(Boolean).join(" · ") || " "}
          </Typography>
        </Box>
        <Button variant="outlined" onClick={() => router.push(EDIT_ROUTE, { id: clientId })}>
          {t("edit")}
        </Button>
      </Card>

      {/* Metrics */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
        {metrics.map((m) => (
          <Card key={m.key} variant="base" sx={{ p: "16px 18px" }}>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "-.01em",
                color: m.accent ? "surface.accentBright" : "text.primary",
              }}
            >
              {m.value}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
              {m.label}
            </Typography>
          </Card>
        ))}
      </Box>

      <ListSection
        title={t("sections.about")}
        items={about}
        isLoading={isLoading}
        skeletonShape={{ action: "none" }}
      />
      <ListSection
        title={t("sections.fee")}
        items={fee}
        isLoading={isLoading}
        skeletonShape={{ action: "none" }}
      />

      {client?.notes ? (
        <Card variant="base" sx={{ p: "20px" }}>
          <Typography sx={{ fontSize: 13, fontWeight: 700, mb: "8px" }}>
            {t("sections.notes")}
          </Typography>
          <Typography sx={{ fontSize: 12.5, color: "text.secondary", whiteSpace: "pre-wrap" }}>
            {client.notes}
          </Typography>
        </Card>
      ) : null}
    </Box>
  );
}
