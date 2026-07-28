"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import { useTranslation } from "@recruit/sdk";
import type { ReactNode } from "react";
import { ActionsMenu } from "../renderers/actions-menu";
import type { ActionItem } from "../renderers/actions-renderer";
import { EntityRenderer, type EntityRendererConfig } from "../renderers/entity-renderer";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { StatusRenderer, type StatusRendererConfig } from "../renderers/status-renderer";

/** One outlined button in the header's action row. */
export interface DetailHeaderAction extends LinkRendererConfig {
  /** Free-form discriminator, so a screen can identify its own actions. */
  type?: string;
  icon?: string;
  label?: { name: string };
}

export interface DetailHeaderConfig {
  /** Logo tile / avatar plus the name and meta line under it. */
  entity: EntityRendererConfig;
  /** Pills drawn inline after the name, in order. */
  chips?: StatusRendererConfig[];
  /** Outlined buttons, left of the primary one. */
  actions?: DetailHeaderAction[];
  /** The filled accent button. */
  primaryAction?: DetailHeaderAction;
  /** Rows of the overflow (⋮) menu. */
  menuActions?: ActionItem[];
}

/**
 * The identity row every detail screen opens with: entity block on the left,
 * its state chips inline with the name, then the action row and overflow menu.
 * Presentational — the owning component fetches and shapes the record, so the
 * client and contact screens share this without sharing an endpoint.
 */
export function DetailHeaderRenderer({
  id,
  config,
  data,
  isLoading,
  extra,
}: {
  id: string;
  config: DetailHeaderConfig;
  data: Record<string, unknown>;
  isLoading?: boolean;
  /** Rendered between the entity and the actions (e.g. a live-time caption). */
  extra?: ReactNode;
}) {
  const { t } = useTranslation(id);

  // The identity block is the page title — an empty tile and a blank name
  // while it loads reads as broken, so it holds its shape instead.
  if (isLoading) {
    return (
      <Box sx={ROW_SX}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "15px", minWidth: 0 }}>
          <Skeleton
            variant={config.entity.shape === "circle" ? "circular" : "rounded"}
            width={56}
            height={56}
            sx={{ borderRadius: config.entity.shape === "circle" ? undefined : "16px" }}
          />
          <Box>
            <Skeleton variant="text" width={220} height={30} />
            <Skeleton variant="text" width={300} height={18} />
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
          {[132, 150, 158].map((width) => (
            <Skeleton
              key={width}
              variant="rounded"
              width={width}
              height={38}
              sx={{ borderRadius: "999px" }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={ROW_SX}>
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "15px", minWidth: 0, flex: "1 1 auto" }}
      >
        <EntityRenderer
          config={config.entity}
          data={data}
          titleAdornment={config.chips?.map((chip) => (
            <StatusRenderer key={chip.path ?? chip.id} config={chip} data={data} />
          ))}
        />
        {extra}
      </Box>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: "8px", flex: "none", flexWrap: "wrap" }}
      >
        {config.actions?.map((action) => (
          <LinkRenderer
            key={action.label?.name ?? action.icon}
            config={{ id, ...action }}
            data={data}
          >
            <Button
              variant="outlined"
              startIcon={action.icon ? <IconRenderer name={action.icon} size={15} /> : undefined}
            >
              {t(action.label?.name ?? "")}
            </Button>
          </LinkRenderer>
        ))}
        {config.primaryAction ? (
          <LinkRenderer config={{ id, ...config.primaryAction }} data={data}>
            <Button
              variant="contained"
              startIcon={
                config.primaryAction.icon ? (
                  <IconRenderer name={config.primaryAction.icon} size={15} />
                ) : undefined
              }
            >
              {t(config.primaryAction.label?.name ?? "")}
            </Button>
          </LinkRenderer>
        ) : null}
        {config.menuActions?.length ? (
          <ActionsMenu id={id} actions={config.menuActions} data={data} />
        ) : null}
      </Box>
    </Box>
  );
}

const ROW_SX = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
  flexWrap: "wrap",
} as const;
