"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
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
  type Attachment,
  AttachmentsWidget,
  type AttachmentUploader,
  type FormValues,
  FormWithSectionsRenderer,
  IconRenderer,
  Modal,
  useModal,
  useToast,
} from "@recruit/shared";
import { useMemo, useRef, useState } from "react";
import type { ContactFormConfiguration } from "./contact-form.configuration";

interface Contact {
  id: string;
  name: string;
  salutation: string;
  firstName: string;
  lastName: string;
  title: string;
  department: string;
  email: string;
  secondaryEmail: string;
  phone: string;
  mobile: string;
  linkedin: string;
  twitter: string;
  notes: string;
  source: string;
  attachments: Attachment[];
  clientId: string;
  ownerId: string;
  isPrimary: boolean;
  emailOptOut: boolean;
}

const SOURCES = [
  "added_by_user",
  "referral",
  "linkedin",
  "inbound",
  "event",
  "cold_outreach",
  "import",
  "api",
  "other",
];
const SALUTATIONS = ["", "mr", "ms", "mrs", "dr", "mx"];

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");
/** Does a phone field hold an actual number (not just a dial code)? */
const hasNumber = (value: unknown) =>
  str(value)
    .replace(/^\+\d+/, "")
    .replace(/\D/g, "").length > 0;
/** Digits + leading `+` only. */
const toE164 = (value: string) => value.replace(/[^\d+]/g, "");
const normalizeEmail = (value: string) => value.trim().toLowerCase();
const normalizeLinkedin = (value: string) => {
  const v = value.trim();
  if (!v || /^https?:\/\//i.test(v)) return v;
  return /^([\w-]+\.)?linkedin\.com/i.test(v) ? `https://${v}` : v;
};
const normalizeTwitter = (value: string) => {
  const v = value.trim();
  if (!v) return v;
  const handle = v.replace(/^https?:\/\/(x|twitter)\.com\//i, "").replace(/^@/, "");
  return `@${handle.replace(/\/.*$/, "")}`;
};

export function ContactFormComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ContactFormConfiguration>(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const params = useRouteParams();
  const contactId = params.id;
  const isEdit = Boolean(contactId);

  const { data, isLoading, mutation } = useFetch<Contact>(id, { filters: { id: contactId } });

  // "Save & add another" creates then remounts the form empty via this key.
  const [formKey, setFormKey] = useState(0);
  const addAnother = useRef(false);
  const dupModal = useModal<{ payload: Record<string, unknown>; matches: Contact[] }>();

  // The attachments widget uploads through the datasource — no endpoint in the
  // shared widget.
  const uploader = useMemo<AttachmentUploader>(() => {
    const mut = mutation as Record<string, ((...args: unknown[]) => Promise<unknown>) | undefined>;
    return (file, onProgress) => mut.uploadAsset?.(file, onProgress) as Promise<Attachment>;
  }, [mutation]);
  const widgets = useMemo(
    () => ({
      attachments: (props: Parameters<typeof AttachmentsWidget>[0]) => (
        <AttachmentsWidget {...props} uploader={uploader} />
      ),
    }),
    [uploader],
  );

  const schema = useMemo(() => {
    if (!config.schema) return config.schema;
    const { source, salutation } = config.schema.properties;
    return {
      ...config.schema,
      properties: {
        ...config.schema.properties,
        source: { ...source, enumNames: SOURCES.map((s) => t(`source.${s}`)) },
        salutation: {
          ...salutation,
          enumNames: SALUTATIONS.map((s) => t(`salutation.${s || "none"}`)),
        },
      },
    };
  }, [config.schema, t]);

  if (!config.schema) return null;
  const loading = isEdit && (isLoading || !data);

  const persist = async (payload: Record<string, unknown>) => {
    const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;
    dupModal.close();
    if (isEdit) {
      await mut.update?.({ id: contactId, ...payload });
      show(t("toast.updated"));
      router.push(config.listRouteId);
      return;
    }
    await mut.create?.(payload);
    show(t("toast.created"));
    // Add-another clears the form (remount) and stays; otherwise go to the list.
    if (addAnother.current) setFormKey((key) => key + 1);
    else router.push(config.listRouteId);
  };

  const save = async (all: FormValues) => {
    const mut = mutation as Record<string, ((query?: unknown) => Promise<unknown>) | undefined>;
    // `tips` is a display-only callout — never persisted.
    const { tips: _tips, ...values } = all;

    // Cross-field rules ajv can't express per-field.
    const email = normalizeEmail(str(values.email));
    const secondaryEmail = normalizeEmail(str(values.secondaryEmail));
    if (!email && !hasNumber(values.phone) && !hasNumber(values.mobile)) {
      show(t("errors.contactMethod"));
      return;
    }
    if (email && secondaryEmail && email === secondaryEmail) {
      show(t("errors.secondaryEqualsPrimary"));
      return;
    }

    // The attachments widget uploads on pick, so each item already carries a
    // stored URL — just drop any stray File before persisting.
    const attachments = ((values.attachments as Attachment[] | undefined) ?? [])
      .filter((item) => item.url)
      .map(({ name, url, size, type }) => ({ name, url, size, type }));

    // Normalize so what we store is canonical (server re-checks too).
    const mobile = hasNumber(values.mobile) ? toE164(str(values.mobile)) : "";
    const payload = {
      ...values,
      email,
      secondaryEmail,
      phone: hasNumber(values.phone) ? toE164(str(values.phone)) : "",
      mobile,
      linkedin: normalizeLinkedin(str(values.linkedin)),
      twitter: normalizeTwitter(str(values.twitter)),
      attachments,
    };

    // Warn on a likely duplicate under the same client before creating one.
    const result = (await mut.checkDuplicates?.({
      clientId: str(values.clientId),
      email,
      mobile,
      firstName: str(values.firstName),
      lastName: str(values.lastName),
      excludeId: contactId,
    })) as { data?: Contact[] } | undefined;
    const matches = result?.data ?? [];
    if (matches.length) {
      dupModal.open({ payload, matches });
      return;
    }

    await persist(payload);
  };

  const defaultValues: FormValues =
    isEdit && data
      ? {
          salutation: data.salutation,
          firstName: data.firstName,
          lastName: data.lastName,
          clientId: data.clientId,
          department: data.department,
          title: data.title,
          email: data.email,
          secondaryEmail: data.secondaryEmail,
          phone: data.phone,
          mobile: data.mobile,
          linkedin: data.linkedin,
          twitter: data.twitter,
          notes: data.notes,
          attachments: data.attachments ?? [],
          ownerId: data.ownerId,
          source: data.source,
          isPrimary: data.isPrimary,
          emailOptOut: data.emailOptOut,
        }
      : {};

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Link
        component="button"
        type="button"
        onClick={() => router.push(config.listRouteId)}
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
      <FormWithSectionsRenderer
        key={`${contactId ?? "new"}-${formKey}`}
        id={id}
        title={isEdit ? "editTitle" : "newTitle"}
        description={isEdit ? "editDescription" : "newDescription"}
        schema={schema}
        sections={config.sections}
        sectionsContainer={config.sectionsContainer}
        defaultValues={defaultValues}
        onSubmit={save}
        isLoading={loading}
        actionsPlacement="header"
        widgets={widgets}
        actions={(state) => (
          <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
            <Button
              variant="outlined"
              onClick={() => router.push(config.listRouteId)}
              disabled={state.isSubmitting}
              sx={{ fontWeight: 400 }}
            >
              {t("actions.cancel")}
            </Button>
            {isEdit ? null : (
              <Button
                variant="outlined"
                onClick={() => {
                  addAnother.current = true;
                  state.submit();
                }}
                disabled={state.isSubmitting}
                sx={{ fontWeight: 400 }}
              >
                {t("actions.saveAnother")}
              </Button>
            )}
            <Button
              variant="contained"
              loading={state.isSubmitting}
              startIcon={<IconRenderer name={isEdit ? "check" : "person-add"} size={16} />}
              onClick={() => {
                addAnother.current = false;
                state.submit();
              }}
            >
              {t(isEdit ? "actions.save" : "actions.create")}
            </Button>
          </Box>
        )}
      />

      <Modal
        open={dupModal.isOpen}
        onClose={dupModal.close}
        title={t("duplicate.title")}
        description={t("duplicate.body")}
        footer={
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "8px", mt: "20px" }}>
            <Button variant="outlined" onClick={dupModal.close}>
              {t("actions.cancel")}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const first = dupModal.data?.matches[0];
                if (first) router.push("Recruit.ContactEdit.Route", { id: first.id });
              }}
            >
              {t("duplicate.open")}
            </Button>
            <Button
              variant="contained"
              onClick={() => dupModal.data && persist(dupModal.data.payload)}
            >
              {t("duplicate.createAnyway")}
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {(dupModal.data?.matches ?? []).map((match) => (
            <Box
              key={match.id}
              sx={{
                p: "10px 12px",
                borderRadius: "10px",
                border: "1px solid",
                borderColor: "surface.border",
                bgcolor: "surface.inset",
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{match.name}</Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                {[match.title, match.email, match.mobile].filter(Boolean).join(" • ")}
              </Typography>
            </Box>
          ))}
        </Box>
      </Modal>
    </Box>
  );
}
