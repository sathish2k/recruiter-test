"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Link from "@mui/material/Link";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import delve from "dlv";
import type {
  ClientDetailAgreementConfiguration,
  DetailFieldConfig,
} from "./client-detail-agreement.configuration";

interface ContractFile {
  name?: string;
  url?: string;
}

interface Client {
  feeBasis: string;
  feeValue: string;
  replacementPeriod: string;
  contractRenewsAt: string;
  contract: ContractFile[] | null;
  createdAt: string;
}

/** The rail's commercial terms — one key/value row per configured field. */
export function ClientDetailAgreementComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientDetailAgreementConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Client>(id, { filters: { id: params.id } });

  if (!config?.fields) return null;

  // One skeleton row per configured term, so the card keeps its height.
  if (isLoading || !data) {
    return (
      <Card variant="base" sx={{ p: "18px 20px" }}>
        <Skeleton variant="text" width={110} height={22} sx={{ mb: "6px" }} />
        {config.fields.map((field) => (
          <Box
            key={field.key}
            sx={{ display: "flex", justifyContent: "space-between", gap: "14px", py: "7px" }}
          >
            <Skeleton variant="text" width={110} height={16} />
            <Skeleton variant="text" width={78} height={16} />
          </Box>
        ))}
        <Skeleton variant="rounded" height={52} sx={{ mt: "12px", borderRadius: "12px" }} />
      </Card>
    );
  }

  const contract = data?.contract?.[0];

  const record = {
    ...(data ?? {}),
    // The card reads a sentence per term, not the stored enum ids.
    feeSummary: data?.feeValue
      ? t(`feeSummary.${data.feeBasis || "percent"}`, { value: data.feeValue })
      : "",
    replacementLabel: data?.replacementPeriod
      ? t(`replacementPeriod.${data.replacementPeriod}`, data.replacementPeriod)
      : "",
    renewsLabel: data?.contractRenewsAt
      ? new Date(data.contractRenewsAt).toLocaleDateString(undefined, {
          month: "short",
          year: "numeric",
        })
      : "",
  } as Record<string, unknown>;

  const fieldRow = (field: DetailFieldConfig) => {
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
            sx={{ fontSize: 12.5, textAlign: "right", minWidth: 0, wordBreak: "break-word" }}
          >
            {label}
          </Link>
        ) : (
          <Typography
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
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

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "6px" }}>
        {t(config.title.name)}
      </Typography>
      {config.fields.map(fieldRow)}

      {contract?.url ? (
        <Box
          component="a"
          href={contract.url}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
            mt: "12px",
            p: "11px 13px",
            borderRadius: "12px",
            bgcolor: "surface.inset",
            border: "1px solid",
            borderColor: "surface.controlBorder",
            color: "inherit",
            textDecoration: "none",
          }}
        >
          <Box sx={{ display: "flex", color: "error.light", flex: "none" }}>
            <IconRenderer name="pdf" size={18} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: 12.5,
                fontWeight: 600,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {contract.name}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "1px" }}>
              {t("contract.signed", {
                date: data?.createdAt
                  ? new Date(data.createdAt).toLocaleDateString(undefined, {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "",
              })}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", color: "surface.textDisabled", flex: "none" }}>
            <IconRenderer name="download" size={16} />
          </Box>
        </Box>
      ) : null}
    </Card>
  );
}
