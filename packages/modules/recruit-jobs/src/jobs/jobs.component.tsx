"use client";

import Box from "@mui/material/Box";
import { useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import { TableFilterExportRenderer, useToast } from "@recruit/shared";

interface Job {
  id: string;
  title: string;
  [key: string]: unknown;
}

const NEW_ROUTE = "Recruit.JobNew.Route";
const EDIT_ROUTE = "Recruit.JobEdit.Route";

export function JobsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const { mutation, mutate } = useFetch<Job[]>(id);

  const mut = mutation as Record<string, ((arg?: unknown) => Promise<unknown>) | undefined>;
  const remove = async (row: Job) => {
    await mut.remove?.(row.id);
    await mutate();
    show(t("toast.deleted", { name: row.title }));
  };

  return (
    <Box>
      <TableFilterExportRenderer
        id={id}
        onCta={(action) => {
          if (action === "add") router.push(NEW_ROUTE);
        }}
        actionHandler={{
          edit: (row) => router.push(EDIT_ROUTE, { id: String(row.id ?? "") }),
          delete: (row) => remove(row as unknown as Job),
        }}
      />
    </Box>
  );
}
