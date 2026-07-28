"use client";

import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { DetailHeaderRenderer } from "@recruit/shared";
import type { JobDetailHeaderConfiguration } from "./job-detail-header.configuration";

interface JobSummary {
  id: string;
  title: string;
  reference: string;
  clientName: string;
  roleCategory: string;
  workModel: string;
  employmentType: string;
  locationLabel: string;
}

/** Only the two composed lines are assembled here — the row itself is the
 * shared detail header the client and contact screens draw. */
export function JobDetailHeaderComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<JobDetailHeaderConfiguration>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<JobSummary>(id, { filters: { id: params.id } });

  if (!config?.header) return null;

  const record = {
    ...(data ?? {}),
    subtitleLine: [
      data?.reference,
      data?.roleCategory ? t(`roleCategories.${data.roleCategory}`, data.roleCategory) : "",
      data?.clientName,
    ]
      .filter(Boolean)
      .join(" · "),
    locationLine: [
      data?.locationLabel ? t(`locations.${data.locationLabel}`, data.locationLabel) : "",
      data?.employmentType ? t(`employmentType.${data.employmentType}`, data.employmentType) : "",
    ]
      .filter(Boolean)
      .join(" · "),
  } as Record<string, unknown>;

  return (
    <DetailHeaderRenderer
      id={id}
      config={config.header}
      data={record}
      isLoading={isLoading || !data}
    />
  );
}
