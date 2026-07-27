"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useRouteParams,
  useTranslation,
} from "@recruit/sdk";
import {
  ActionsMenu,
  EntityRenderer,
  IconRenderer,
  LinkRenderer,
  StatCardRenderer,
  StatusRenderer,
  TableRenderer,
} from "@recruit/shared";
import delve from "dlv";
import type { ReactNode } from "react";
import type { ClientDetailConfiguration, DetailFieldConfig } from "./client-detail.configuration";

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
  roles: Record<string, unknown>[];
  contacts: Record<string, unknown>[];
}

export function ClientDetailComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientDetailConfiguration>(id);
  const router = usePortalRouter();
  const params = useRouteParams();
  const clientId = params.id;
  const { data, isLoading } = useFetch<Client>(id, { filters: { id: clientId } });

  const client = data;

  const addr = client?.address ?? {};
  const record = {
    ...(client ?? {}),
    addressLine: [addr.street, addr.city, addr.state, addr.postalCode, addr.country]
      .filter(Boolean)
      .join(", "),
    // The design's meta line under the client name.
    subtitleLine: [
      client?.industry,
      client?.accountLeadName ? `${t("subtitle.accountLead")}: ${client.accountLeadName}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  } as Record<string, unknown>;

  /** One key/value row, rendered from its config entry. */
  const fieldRow = (field: DetailFieldConfig): ReactNode => {
    const raw = delve(record, field.path);
    const text = raw === undefined || raw === null || raw === "" ? "" : String(raw);
    const label = field.translate && text ? t(`${field.translate}.${text}`, text) : text;
    const href =
      !text || field.as === "text" || !field.as
        ? undefined
        : field.as === "email"
          ? `mailto:${text}`
          : field.as === "phone"
            ? `tel:${text.replace(/\s+/g, "")}`
            : text.startsWith("http")
              ? text
              : `https://${text}`;

    return (
      <Box
        key={field.key}
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "14px",
          py: "7px",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "text.disabled", flex: "none" }}>
          {t(field.label)}
        </Typography>
        {href ? (
          <Link
            href={href}
            target={field.as === "link" ? "_blank" : undefined}
            rel={field.as === "link" ? "noopener noreferrer" : undefined}
            sx={{ fontSize: 12.5, textAlign: "right", minWidth: 0, wordBreak: "break-word" }}
          >
            {label}
          </Link>
        ) : (
          <Typography
            sx={{
              fontSize: 12.5,
              color: text ? "text.primary" : "text.disabled",
              textAlign: "right",
              minWidth: 0,
              wordBreak: "break-word",
            }}
          >
            {label || "—"}
          </Typography>
        )}
      </Box>
    );
  };

  const card = (title: string, fields: DetailFieldConfig[]) => (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "6px" }}>{t(title)}</Typography>
      {fields.map(fieldRow)}
    </Card>
  );

  if (!config.stats) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Header — identity, state and the action row. */}
      <Card
        variant="base"
        sx={{ p: "22px", display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <EntityRenderer config={config.header.entity} data={record} />
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "8px" }}>
            <StatusRenderer config={config.header.status} data={record} />
            <StatusRenderer config={config.header.health} data={record} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flex: "none" }}>
          <LinkRenderer config={{ id, ...config.primaryAction }} data={record}>
            <Button
              variant="contained"
              startIcon={
                config.primaryAction.icon ? (
                  <IconRenderer name={config.primaryAction.icon} size={15} />
                ) : undefined
              }
            >
              {t(config.primaryAction.label?.name ?? "")}
            </Button>
          </LinkRenderer>
          <ActionsMenu id={id} actions={config.menuActions} data={record} />
        </Box>
      </Card>

      {/* Main column + rail. */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(0,1fr) 350px" },
          gap: "16px",
          alignItems: "start",
        }}
      >
        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
          <StatCardRenderer id={id} config={config.stats} data={record} />

          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "10px" }}>
              {t("sections.roles")}
            </Typography>
            <TableRenderer id={id} config={config.roles} data={client?.roles ?? []} />
          </Box>

          {client?.notes ? (
            <Card variant="base" sx={{ p: "20px" }}>
              <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "8px" }}>
                {t("sections.notes")}
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.secondary", whiteSpace: "pre-wrap" }}>
                {client.notes}
              </Typography>
            </Card>
          ) : null}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: 0 }}>
          {card("sections.about", config.about)}
          {card("sections.agreement", config.agreement)}
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "10px" }}>
              {t("sections.contacts")}
            </Typography>
            <TableRenderer id={id} config={config.contacts} data={client?.contacts ?? []} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
