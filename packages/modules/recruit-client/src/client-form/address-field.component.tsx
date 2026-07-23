"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Checkbox from "@mui/material/Checkbox";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import type { WidgetProps } from "@recruit/shared";

interface AddressLines {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

interface AddressValue {
  billing?: AddressLines;
  shipping?: AddressLines;
  sameAsBilling?: boolean;
}

const PLACEHOLDERS: Record<keyof AddressLines, { ph: string; fallback: string }> = {
  street: { ph: "address.street", fallback: "Street" },
  city: { ph: "address.city", fallback: "City" },
  state: { ph: "address.state", fallback: "Province / State" },
  postalCode: { ph: "address.postalCode", fallback: "Postal code" },
  country: { ph: "address.country", fallback: "Country" },
};

/**
 * Client billing + shipping address in two labelled columns, with a "shipping
 * same as billing" toggle that mirrors (and locks) the shipping column. Owns its
 * whole card — dropped into a `bare` section. Its value is
 * `{ billing, shipping, sameAsBilling }`, split back into two columns on save.
 * Lives in the client module (not shared) — it's specific to this screen.
 */
export function AddressField({ prop, field, t }: WidgetProps) {
  const value = (field.value ?? {}) as AddressValue;
  const billing = value.billing ?? {};
  const shipping = value.shipping ?? {};
  const same = value.sameAsBilling ?? true;

  const emit = (next: AddressValue) =>
    field.onChange({ billing, shipping, sameAsBilling: same, ...next });

  const setBilling = (key: keyof AddressLines, v: string) => {
    const nextBilling = { ...billing, [key]: v };
    emit({ billing: nextBilling, shipping: same ? nextBilling : shipping });
  };
  const setShipping = (key: keyof AddressLines, v: string) =>
    emit({ shipping: { ...shipping, [key]: v } });
  const toggleSame = () => {
    const nextSame = !same;
    emit({ sameAsBilling: nextSame, shipping: nextSame ? billing : shipping });
  };

  const column = (
    caption: string,
    lines: AddressLines,
    onChange: (key: keyof AddressLines, v: string) => void,
    disabled?: boolean,
  ) => {
    const input = (key: keyof AddressLines) => (
      <TextField
        value={lines[key] ?? ""}
        onChange={(event) => onChange(key, event.target.value)}
        placeholder={t(PLACEHOLDERS[key].ph, PLACEHOLDERS[key].fallback)}
        disabled={disabled}
        fullWidth
      />
    );
    const pair = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" } as const;
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: 0 }}>
        <Typography
          sx={{ fontSize: 11.5, letterSpacing: ".1em", fontWeight: 700, color: "text.disabled" }}
        >
          {caption}
        </Typography>
        {input("street")}
        <Box sx={pair}>
          {input("city")}
          {input("state")}
        </Box>
        <Box sx={pair}>
          {input("postalCode")}
          {input("country")}
        </Box>
      </Box>
    );
  };

  return (
    <Card
      variant="base"
      sx={{ p: "20px 22px", display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
          {t(prop.title ?? "address.title", "Address")}
        </Typography>
        <Box
          component="button"
          type="button"
          onClick={toggleSame}
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            border: "none",
            background: "none",
            cursor: "pointer",
            p: 0,
            fontSize: 12.5,
            fontWeight: 600,
            color: same ? "text.primary" : "text.secondary",
            "&:hover": { color: "text.primary" },
          }}
        >
          <Checkbox checked={same} size="small" sx={{ p: 0 }} tabIndex={-1} disableRipple />
          {t("address.sameAsBilling", "Shipping same as billing")}
        </Box>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: "20px",
        }}
      >
        {column(t("address.billing", "Billing"), billing, setBilling)}
        {column(t("address.shipping", "Shipping"), same ? billing : shipping, setShipping, same)}
      </Box>
    </Card>
  );
}
