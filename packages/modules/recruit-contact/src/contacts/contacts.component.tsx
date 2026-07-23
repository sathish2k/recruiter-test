"use client";

import Box from "@mui/material/Box";
import { useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import { TableFilterExportRenderer, useFilters, useToast } from "@recruit/shared";
import { useMemo } from "react";
import { ClientCell, ContactCell } from "./contacts.cells";

interface Contact {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  ownerId: string;
  ownerName: string;
  isPrimary: boolean;
  [key: string]: unknown;
}

const NEW_ROUTE = "Recruit.ContactNew.Route";
const EDIT_ROUTE = "Recruit.ContactEdit.Route";

export function ContactsComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const { filters } = useFilters();
  const { show } = useToast();
  const router = usePortalRouter();

  const query = useMemo(() => ({ ...filters }), [filters]);
  const { mutation, mutate } = useFetch<Contact[]>(id, { filters: query });

  type Mut = Record<string, ((arg?: unknown) => Promise<unknown>) | undefined>;
  const mut = mutation as Mut;

  const archive = async (row: Contact) => {
    await mut.archive?.(row.id);
    await mutate();
    show(t("toast.archived", { name: row.name }));
  };
  const setPrimary = async (row: Contact) => {
    await mut.setPrimary?.(row.id);
    await mutate();
    show(t("toast.primary", { name: row.name }));
  };

  return (
    <Box>
      <TableFilterExportRenderer
        id={id}
        onCta={(action) => {
          if (action === "add") router.push(NEW_ROUTE);
        }}
        cells={{
          contactCell: (row) => ContactCell(row, t),
          clientCell: (row) => ClientCell(row),
        }}
        actionHandler={{
          view: (row) => router.push(EDIT_ROUTE, { id: String(row.id ?? "") }),
          edit: (row) => router.push(EDIT_ROUTE, { id: String(row.id ?? "") }),
          setPrimary: (row) => setPrimary(row as unknown as Contact),
          archive: (row) => archive(row as unknown as Contact),
        }}
      />
    </Box>
  );
}
