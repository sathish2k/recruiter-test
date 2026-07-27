"use client";

import Box from "@mui/material/Box";
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
  useToast,
} from "@recruit/shared";
import { useMemo } from "react";
import type { ClientFormConfiguration } from "./client-form.configuration";

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
const str = (v: unknown) => (typeof v === "string" ? v : "");

export function ClientFormComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ClientFormConfiguration>(id);
  const { show } = useToast();
  const router = usePortalRouter();
  const params = useRouteParams();
  const clientId = params.id;
  const isEdit = Boolean(clientId);

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

  const save = async (values: FormValues, meta?: { addAnother?: boolean }) => {
    const mut = mutation as Record<string, ((body?: unknown) => Promise<unknown>) | undefined>;
    const {
      attachments: rawAttachments,
      contract: rawContract,
      // Display-only / flattened fields — not sent verbatim.
      feeInfo: _feeInfo,
      sameAsBilling,
      billingStreet,
      billingCity,
      billingState,
      billingPostal,
      billingCountry,
      shipStreet,
      shipCity,
      shipState,
      shipPostal,
      shipCountry,
      feePercent,
      feeFlat,
      ...rest
    } = values;

    const billing = {
      street: str(billingStreet),
      city: str(billingCity),
      state: str(billingState),
      postalCode: str(billingPostal),
      country: str(billingCountry),
    };
    const shipping = sameAsBilling
      ? billing
      : {
          street: str(shipStreet),
          city: str(shipCity),
          state: str(shipState),
          postalCode: str(shipPostal),
          country: str(shipCountry),
        };
    // Only the fee input matching the chosen basis is visible — coalesce it.
    const feeValue = (rest.feeBasis ?? "percent") === "flat" ? str(feeFlat) : str(feePercent);

    const payload = {
      ...rest,
      feeValue,
      address: billing,
      shippingAddress: shipping,
      shippingSameAsBilling: Boolean(sameAsBilling),
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
    // Add-another: the renderer already cleared the form — just stay.
    if (!meta?.addAnother) router.push(config.listRouteId);
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
          feePercent: data.feeBasis === "percent" ? data.feeValue : "",
          feeFlat: data.feeBasis === "flat" ? data.feeValue : "",
          paymentTerms: data.paymentTerms,
          billingEmail: data.billingEmail,
          taxId: data.taxId,
          notes: data.notes,
          contract: data.contract ?? [],
          attachments: data.attachments ?? [],
          sameAsBilling: data.shippingSameAsBilling ?? true,
          billingStreet: data.address?.street ?? "",
          billingCity: data.address?.city ?? "",
          billingState: data.address?.state ?? "",
          billingPostal: data.address?.postalCode ?? "",
          billingCountry: data.address?.country ?? "",
          shipStreet: data.shippingAddress?.street ?? "",
          shipCity: data.shippingAddress?.city ?? "",
          shipState: data.shippingAddress?.state ?? "",
          shipPostal: data.shippingAddress?.postalCode ?? "",
          shipCountry: data.shippingAddress?.country ?? "",
        }
      : { feeBasis: "percent", paymentTerms: "net30", sameAsBilling: true };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <FormWithSectionsRenderer
        key={clientId ?? "new"}
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
        submitLabel={isEdit ? "actions.save" : "actions.create"}
        submitIcon={isEdit ? "check" : "domain-add"}
        cancelLabel="actions.cancel"
        onCancel={() => router.push(config.listRouteId)}
        addAnotherLabel={isEdit ? undefined : "actions.saveAnother"}
      />
    </Box>
  );
}
