"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
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
  useToast,
} from "@recruit/shared";
import { useMemo, useRef, useState } from "react";
import { AddressField } from "./address-field.component";
import type { ClientFormConfiguration } from "./client-form.configuration";
import { FeeValueField } from "./fee-value-field.component";

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
  parentCompany: string;
  primaryContactId: string;
  industry: string;
  website: string;
  phone: string;
  billingEmail: string;
  address: ClientAddress | null;
  shippingAddress: ClientAddress | null;
  shippingSameAsBilling: boolean;
  contract: Attachment[];
  attachments: Attachment[];
  accountLeadId: string;
  source: string;
  feeBasis: string;
  feeValue: string;
  paymentTerms: string;
  taxId: string;
  notes: string;
}

const FEE_BASIS = ["percent", "flat"];
const SOURCES = ["added_by_user", "referral", "inbound", "outbound", "event"];
const PAYMENT_TERMS = ["net15", "net30", "net45", "net60"];

export function ClientFormComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientFormConfiguration>(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const params = useRouteParams();
  const clientId = params.id;
  const isEdit = Boolean(clientId);

  // "Save & add another" creates then remounts the form empty via this key.
  const [formKey, setFormKey] = useState(0);
  const addAnother = useRef(false);

  const { data, isLoading, mutation } = useFetch<Client>(id, { filters: { id: clientId } });

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
      address: AddressField,
      feeValue: FeeValueField,
    }),
    [uploader],
  );

  const schema = useMemo(() => {
    if (!config.schema) return config.schema;
    const { feeBasis, source, paymentTerms } = config.schema.properties;
    return {
      ...config.schema,
      properties: {
        ...config.schema.properties,
        feeBasis: { ...feeBasis, enumNames: FEE_BASIS.map((f) => t(`feeBasis.${f}`)) },
        source: { ...source, enumNames: SOURCES.map((s) => t(`source.${s}`)) },
        paymentTerms: {
          ...paymentTerms,
          enumNames: PAYMENT_TERMS.map((p) => t(`paymentTermsOptions.${p}`)),
        },
      },
    };
  }, [config.schema, t]);

  if (!config.schema) return null;
  const loading = isEdit && (isLoading || !data);

  const cleanFiles = (raw: unknown) =>
    ((raw as Attachment[] | undefined) ?? [])
      .filter((item) => item.url)
      .map(({ name, url, size, type }) => ({ name, url, size, type }));

  const save = async (values: FormValues) => {
    const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;
    const {
      address: rawAddress,
      attachments: rawAttachments,
      contract: rawContract,
      // `feeInfo` is a display-only banner — never persisted.
      feeInfo: _feeInfo,
      ...rest
    } = values;
    const addr = (rawAddress ?? {}) as {
      billing?: ClientAddress;
      shipping?: ClientAddress;
      sameAsBilling?: boolean;
    };
    const billing = addr.billing ?? {};
    const same = addr.sameAsBilling ?? true;
    const payload = {
      ...rest,
      address: billing,
      shippingAddress: same ? billing : (addr.shipping ?? {}),
      shippingSameAsBilling: same,
      contract: cleanFiles(rawContract),
      attachments: cleanFiles(rawAttachments),
    };

    if (isEdit) {
      await mut.update?.({ id: clientId, ...payload });
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

  const defaultValues: FormValues =
    isEdit && data
      ? {
          name: data.name,
          parentCompany: data.parentCompany,
          primaryContactId: data.primaryContactId,
          industry: data.industry,
          website: data.website,
          phone: data.phone,
          accountLeadId: data.accountLeadId,
          source: data.source,
          feeBasis: data.feeBasis,
          feeValue: data.feeValue,
          paymentTerms: data.paymentTerms,
          billingEmail: data.billingEmail,
          taxId: data.taxId,
          notes: data.notes,
          contract: data.contract ?? [],
          attachments: data.attachments ?? [],
          address: {
            billing: data.address ?? {},
            shipping: data.shippingAddress ?? {},
            sameAsBilling: data.shippingSameAsBilling ?? true,
          },
        }
      : { feeBasis: "percent", paymentTerms: "net30" };

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
        key={`${clientId ?? "new"}-${formKey}`}
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
              startIcon={<IconRenderer name={isEdit ? "check" : "domain-add"} size={16} />}
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
    </Box>
  );
}
