"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import type { ActionHandler } from "../renderers/actions-renderer";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer } from "../renderers/link-renderer";
import type { CardActionConfig, CardFooterConfig, T } from "./card-renderer.types";

const PILL_SX = { fontSize: 12, fontWeight: 700, p: "7px 14px" };

export function CardFooterRenderer({
  config,
  data,
  t,
  actionHandler,
  isLoading,
  insideLink,
}: {
  config: CardFooterConfig;
  data: Record<string, unknown>;
  t: T;
  actionHandler?: ActionHandler;
  isLoading?: boolean;
  /** True when the whole card is already a link — nested <a> is invalid HTML
   * and breaks hydration, so action/trailing links render inert instead. */
  insideLink?: boolean;
}) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", gap: "8px", mt: "11px" }}>
        {(config.actions ?? [{}]).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder row
            key={index}
            variant="rounded"
            width={124}
            height={32}
            sx={{ borderRadius: "999px" }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mt: "11px" }}>
      {(config.actions ?? []).map((action) => (
        <CardAction
          key={action.label.name}
          action={insideLink ? { ...action, link: undefined } : action}
          data={data}
          t={t}
          actionHandler={actionHandler}
        />
      ))}
      {config.trailingAction && !insideLink ? (
        <Box sx={{ ml: "auto" }}>
          <LinkRenderer config={config.trailingAction.link} data={data}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "999px",
                border: "1px solid",
                borderColor: "surface.borderStrong",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.primary",
                "&:hover": { background: "action.hover" },
              }}
            >
              <IconRenderer name={config.trailingAction.icon} size={15} color="inherit" />
            </Box>
          </LinkRenderer>
        </Box>
      ) : null}
    </Box>
  );
}

function CardAction({
  action,
  data,
  t,
  actionHandler,
}: {
  action: CardActionConfig;
  data: Record<string, unknown>;
  t: T;
  actionHandler?: ActionHandler;
}) {
  const icon = action.icon ? <IconRenderer name={action.icon} size={14} /> : undefined;
  const label = t(action.label.name, data);

  // The ghost pill is the tinted-card CTA: a translucent fill on a light border,
  // which no Button variant covers.
  if (action.variant === "ghost") {
    const pill = (
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: "5px",
          p: "7px 14px",
          borderRadius: "999px",
          background: "surface.tint",
          border: "1px solid",
          borderColor: "surface.borderStrong",
          fontSize: 12,
          fontWeight: 700,
          cursor: action.link || action.action ? "pointer" : "default",
        }}
        onClick={action.action ? () => actionHandler?.[action.action ?? ""]?.(data) : undefined}
      >
        {icon}
        {label}
        <IconRenderer name="arrow-forward" size={14} color="inherit" />
      </Box>
    );
    return action.link ? (
      <LinkRenderer config={action.link} data={data}>
        {pill}
      </LinkRenderer>
    ) : (
      pill
    );
  }

  const button = (
    <Button
      variant={action.variant === "outlined" ? "outlined" : "contained"}
      color={action.variant === "outlined" ? undefined : "secondary"}
      startIcon={icon}
      onClick={action.action ? () => actionHandler?.[action.action ?? ""]?.(data) : undefined}
      sx={{ ...PILL_SX, fontWeight: action.variant === "outlined" ? 600 : 700 }}
    >
      {label}
    </Button>
  );
  return action.link ? (
    <LinkRenderer config={action.link} data={data}>
      {button}
    </LinkRenderer>
  ) : (
    button
  );
}
