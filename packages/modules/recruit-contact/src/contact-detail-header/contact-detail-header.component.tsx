"use client";

import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { type DetailHeaderConfig, DetailHeaderRenderer } from "@recruit/shared";

interface Contact {
  id: string;
  name: string;
  title: string;
  department: string;
  clientId: string;
  clientName: string;
  ownerName: string;
  createdAt: string;
}

/** The contact's identity row. Only the meta line is assembled here — the row
 * itself is the shared detail header, as on the client screen. */
export function ContactDetailHeaderComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<DetailHeaderConfig>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Contact>(id, { filters: { id: params.id } });

  if (!config?.entity) return null;

  const record = {
    ...(data ?? {}),
    subtitleLine: [
      data?.title,
      data?.department,
      data?.clientName,
      data?.createdAt
        ? t("subtitle.since", {
            date: new Date(data.createdAt).toLocaleDateString(undefined, {
              month: "short",
              year: "numeric",
            }),
          })
        : "",
      data?.ownerName ? `${t("subtitle.owner")}: ${data.ownerName}` : "",
    ]
      .filter(Boolean)
      .join(" · "),
  } as Record<string, unknown>;

  return (
    <DetailHeaderRenderer id={id} config={config} data={record} isLoading={isLoading || !data} />
  );
}
