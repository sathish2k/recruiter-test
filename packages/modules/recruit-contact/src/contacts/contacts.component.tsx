"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import {
  Modal,
  SelectField,
  TableFilterExportRenderer,
  useExport,
  useFilters,
  useModal,
  useRemoteOptions,
  useToast,
} from "@recruit/shared";
import { useMemo, useState } from "react";
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

/** Module scope: a new object each render would loop useRemoteOptions. */
const STATUS_OPTIONS = ["active", "inactive", "left"] as const;

const OWNER_SOURCE = { url: "/users", path: "data", valueKey: "id", labelKey: "name" } as const;

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

  const { exportData } = useExport();
  const ownerModal = useModal<Contact[]>();
  const statusModal = useModal<Contact[]>();
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");
  const owners = useRemoteOptions(OWNER_SOURCE, "");

  /** One mail client draft addressed to everyone picked. */
  const bulkEmail = (rows: Contact[]) => {
    const addresses = rows.map((row) => String(row.email ?? "")).filter(Boolean);
    if (!addresses.length) {
      show(t("toast.noEmails"));
      return;
    }
    window.location.href = `mailto:?bcc=${addresses.join(",")}`;
  };

  const applyStatus = async () => {
    const rows = statusModal.data ?? [];
    await mut.assignStatus?.({ ids: rows.map((row) => row.id), status });
    await mutate();
    statusModal.close();
    setStatus("");
    show(t("toast.statusChanged", { count: rows.length }));
  };

  const applyOwner = async () => {
    const rows = ownerModal.data ?? [];
    await mut.assignOwner?.({ ids: rows.map((row) => row.id), ownerId: owner });
    await mutate();
    ownerModal.close();
    setOwner("");
    show(t("toast.ownerAssigned", { count: rows.length }));
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
        bulkHandler={{
          bulkEmail: (rows) => bulkEmail(rows as unknown as Contact[]),
          bulkOwner: (rows) => ownerModal.open(rows as unknown as Contact[]),
          // Export what is picked, not the whole page.
          bulkStatus: (rows) => statusModal.open(rows as unknown as Contact[]),
          bulkExport: (rows) => exportData("xlsx", rows, "contacts"),
        }}
      />

      <Modal
        open={statusModal.isOpen}
        onClose={statusModal.close}
        title={t("bulk.status")}
        footer={
          <>
            <Button variant="outlined" onClick={statusModal.close}>
              {t("actions.cancel", "Cancel")}
            </Button>
            <Button variant="contained" disabled={!status} onClick={applyStatus}>
              {t("bulk.apply", "Apply")}
            </Button>
          </>
        }
      >
        <SelectField
          value={status}
          onChange={(event) => setStatus(String(event.target.value ?? ""))}
          options={STATUS_OPTIONS.map((value) => ({ value, label: t(`status.${value}`) }))}
        />
      </Modal>

      <Modal
        open={ownerModal.isOpen}
        onClose={ownerModal.close}
        title={t("bulk.owner")}
        footer={
          <>
            <Button variant="outlined" onClick={ownerModal.close}>
              {t("actions.cancel", "Cancel")}
            </Button>
            <Button variant="contained" disabled={!owner} onClick={applyOwner}>
              {t("bulk.assign", "Assign")}
            </Button>
          </>
        }
      >
        <SelectField
          value={owner}
          onChange={(event) => setOwner(String(event.target.value ?? ""))}
          options={owners.options}
        />
      </Modal>
    </Box>
  );
}
