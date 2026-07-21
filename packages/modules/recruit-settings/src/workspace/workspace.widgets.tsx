"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  FieldShell,
  SearchableSelectField,
  type SelectOption,
  TextWidget,
  useRemoteOptions,
  type WidgetProps,
  type Widgets,
} from "@recruit/shared";
import { useState } from "react";
import { useWatch } from "react-hook-form";

/** The design's accent choices — the swatch row under Report branding. */
const ACCENTS = ["#E4560F", "#D69B3C", "#3C7DD6", "#2F9E6B", "#8B5CF6", "#E0457B"];

/** `{ from, to }` — what the business-hours field stores. */
interface HoursRange {
  from?: string;
  to?: string;
}

/** Avatar disc for a teammate row. */
function OwnerAvatar({ row, size }: { row: Record<string, unknown> | undefined; size: number }) {
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "999px",
        flex: "none",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.36,
        fontWeight: 600,
        bgcolor: (row?.avatarBg as string) ?? "surface.tint",
        color: (row?.avatarFg as string) ?? "text.secondary",
      }}
    >
      {(row?.initials as string) ?? ""}
    </Box>
  );
}

/**
 * Teammate picker — avatar in the control and in every option, searched
 * server-side through the field's `optionSource` (GET /users?search=…).
 * Bespoke enough to stay here: no other select needs avatars.
 */
function OwnerPicker({ prop, field, fieldState, t }: WidgetProps) {
  const [search, setSearch] = useState("");
  const { options, loading } = useRemoteOptions(prop.optionSource, search);
  const selected = options.find((o) => o.value === field.value) ?? null;

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Autocomplete<SelectOption>
        options={options}
        loading={loading}
        value={selected}
        onInputChange={(_, next) => setSearch(next)}
        onChange={(_, next) => field.onChange(next?.value ?? "")}
        onBlur={field.onBlur}
        getOptionLabel={(option) => option.label}
        isOptionEqualToValue={(option, value) => option.value === value.value}
        noOptionsText={t("fields.defaultOwnerEmpty")}
        renderOption={(optionProps, option) => {
          const { key, ...rest } = optionProps as typeof optionProps & { key: string };
          return (
            <Box
              component="li"
              key={key}
              {...rest}
              sx={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <OwnerAvatar row={option.raw} size={24} />
              <Box component="span" sx={{ flex: 1 }}>
                {option.label}
              </Box>
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            hiddenLabel
            placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
            error={!!fieldState.error}
            slotProps={{
              input: {
                ...params.slotProps?.input,
                startAdornment: selected ? <OwnerAvatar row={selected.raw} size={26} /> : undefined,
              },
            }}
          />
        )}
      />
    </FieldShell>
  );
}

/** `{ street, city, … }` — what the office-address field stores. */
interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

/** The parts under Street, in the design's column proportions. */
const ADDRESS_PARTS: { key: keyof Address; fr: string }[] = [
  { key: "city", fr: "1.2fr" },
  { key: "state", fr: "1fr" },
  { key: "postalCode", fr: "0.8fr" },
  { key: "country", fr: "1fr" },
];

/**
 * Office address as one field: Street over a tighter four-column row, all under
 * a single label. A nested grid because the row has its own proportions and
 * gap, which a field sitting directly in the section grid can't express.
 */
function AddressGroup({ prop, field, fieldState, t }: WidgetProps) {
  const value = (field.value ?? {}) as Address;
  const set = (part: keyof Address) => (next: string) => field.onChange({ ...value, [part]: next });

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <TextField
        fullWidth
        hiddenLabel
        value={value.street ?? ""}
        onChange={(event) => set("street")(event.target.value)}
        onBlur={field.onBlur}
        placeholder={t("fields.addressStreetPlaceholder")}
      />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: ADDRESS_PARTS.map((p) => p.fr).join(" "),
          gap: "10px",
        }}
      >
        {ADDRESS_PARTS.map(({ key }) => (
          <TextField
            key={key}
            hiddenLabel
            value={value[key] ?? ""}
            onChange={(event) => set(key)(event.target.value)}
            onBlur={field.onBlur}
            placeholder={t(`fields.address${key[0].toUpperCase()}${key.slice(1)}Placeholder`)}
          />
        ))}
      </Box>
    </FieldShell>
  );
}

/**
 * Business hours as one field: a FROM/TO pair under a single label, matching
 * the design's nested grid. Stores `{ from, to }`.
 */
function HoursRangeWidget({ prop, field, fieldState, t }: WidgetProps) {
  const value = (field.value ?? {}) as HoursRange;
  const options: SelectOption[] = (prop.enum ?? []).map((hour: string | number) => ({
    value: String(hour),
    label: String(hour),
  }));
  const set = (part: keyof HoursRange) => (next: string) =>
    field.onChange({ ...value, [part]: next });

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        {(["from", "to"] as const).map((part) => (
          <Box key={part} sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <Typography
              sx={{
                fontSize: 10.5,
                letterSpacing: ".06em",
                fontWeight: 600,
                color: "text.disabled",
              }}
            >
              {t(`fields.businessHours${part === "from" ? "From" : "To"}`)}
            </Typography>
            <SearchableSelectField
              value={value[part] ?? ""}
              onChange={set(part) as (next: never) => void}
              options={options}
            />
          </Box>
        ))}
      </Box>
    </FieldShell>
  );
}

/**
 * ID prefix field with the design's live sample under it. The sample body comes
 * from `previews.<fieldName>` so each prefix shows its own realistic number.
 */
function PrefixPreview(props: WidgetProps) {
  const { name, field, t } = props;
  const sample = t(`previews.${name}`);
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <TextWidget {...props} />
      <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
        {t("previews.label")} ·{" "}
        <Box
          component="span"
          sx={{ fontFamily: "ui-monospace, monospace", color: "surface.textMuted" }}
        >
          {`${field.value ?? ""}${sample}`}
        </Box>
      </Typography>
    </Box>
  );
}

interface DigestPreviewProps {
  accent: string;
  whiteLabelled: boolean;
  t: WidgetProps["t"];
}

/** Miniature weekly-digest email, recoloured live by the accent swatches. */
function DigestPreview({ accent, whiteLabelled, t }: DigestPreviewProps) {
  const soft = `${accent}59`;
  const bars = [40, 65, 50, 85];

  return (
    <Box
      sx={{
        mt: "2px",
        bgcolor: "background.default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "12px",
        p: "14px 16px",
      }}
    >
      <Typography
        sx={{
          fontSize: 10.5,
          letterSpacing: ".08em",
          fontWeight: 600,
          color: "text.disabled",
          mb: "10px",
        }}
      >
        {t("preview.digestTitle")}
      </Typography>
      <Box sx={{ bgcolor: "#FFFFFF", borderRadius: "10px", overflow: "hidden", maxWidth: 430 }}>
        <Box sx={{ height: 6, bgcolor: accent }} />
        <Box sx={{ p: "12px 16px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: "10px",
            }}
          >
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#2A2A26" }}>
              {t("preview.brand")}
            </Typography>
            <Typography sx={{ fontSize: 10, color: "#8A867E" }}>{t("preview.week")}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: "6px", height: 44 }}>
            {bars.map((height, index) => (
              <Box
                key={height}
                sx={{
                  flex: 1,
                  height: `${height}%`,
                  borderRadius: "3px 3px 0 0",
                  bgcolor: index < 2 ? soft : accent,
                }}
              />
            ))}
          </Box>
          <Typography sx={{ fontSize: 9.5, color: "#A7A39B", mt: "8px" }}>
            {whiteLabelled ? t("preview.footerWhiteLabel") : t("preview.footerPowered")}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

/** Accent swatch row + the live digest preview beneath it. */
function AccentSwatches({ prop, field, t }: WidgetProps) {
  // The preview's footer follows the white-label switch as it's toggled, so it
  // watches that field rather than taking a snapshot.
  const whiteLabel = !!useWatch({ name: "whiteLabel" });
  const accent = (field.value as string) || ACCENTS[0];
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        py: "13px",
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{t(prop.title ?? "")}</Typography>
          {prop.help ? (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>{t(prop.help)}</Typography>
          ) : null}
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          {ACCENTS.map((color) => (
            <Box
              key={color}
              role="button"
              aria-label={color}
              onClick={() => field.onChange(color)}
              sx={{
                width: 24,
                height: 24,
                borderRadius: "7px",
                bgcolor: color,
                cursor: "pointer",
                border: "2px solid",
                borderColor: accent === color ? "text.primary" : "transparent",
              }}
            />
          ))}
        </Box>
      </Box>
      <DigestPreview accent={accent} whiteLabelled={whiteLabel} t={t} />
    </Box>
  );
}

/** The workspace form's one-off widgets — resolved by `widget` name. */
export const WORKSPACE_WIDGETS: Widgets = {
  addressGroup: AddressGroup,
  ownerPicker: OwnerPicker,
  hoursRange: HoursRangeWidget,
  prefixPreview: PrefixPreview,
  accentSwatches: AccentSwatches,
};

export { ACCENTS };
