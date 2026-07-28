"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { FactRows, FactRowsSkeleton, ListRenderer } from "@recruit/shared";
import type { ContactDetailInfoConfiguration } from "./contact-detail-info.configuration";

interface Info {
  email: string;
  phone: string;
  linkedin: string;
  timezone: string;
  preferredChannel: string;
}

/** The rail's reachability card — the channels on top, the settings under. */
export function ContactDetailInfoComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ContactDetailInfoConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Info>(id, { filters: { id: params.id } });

  if (!config?.row) return null;

  // Only the channels this contact actually has — an empty row would read as
  // a broken link rather than "not recorded".
  const channels = [
    data?.email && { key: "email", icon: "mail", value: data.email, href: `mailto:${data.email}` },
    data?.phone && {
      key: "phone",
      icon: "call",
      value: data.phone,
      href: `tel:${data.phone.replace(/\s+/g, "")}`,
    },
    data?.linkedin && {
      key: "linkedin",
      icon: "link",
      value: data.linkedin,
      href: data.linkedin.startsWith("http") ? data.linkedin : `https://${data.linkedin}`,
    },
  ].filter(Boolean) as Record<string, unknown>[];

  const facts = {
    ...(data ?? {}),
    channelLabel: data?.preferredChannel ? t(`channels.${data.preferredChannel}`) : "",
  } as Record<string, unknown>;

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Typography sx={{ fontSize: 14, fontWeight: 700, mb: "13px" }}>
        {t(config.title.name)}
      </Typography>
      <ListRenderer
        id={id}
        config={{ variant: "plain", dense: true, row: config.row }}
        data={channels}
        isLoading={isLoading}
      />
      <Divider sx={{ my: "13px" }} />
      <Box>
        {isLoading ? (
          <FactRowsSkeleton fields={config.fields} />
        ) : (
          <FactRows fields={config.fields} data={facts} t={t} />
        )}
      </Box>
    </Card>
  );
}
