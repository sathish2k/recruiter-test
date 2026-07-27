"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { SlidingPillTabs } from "../tabs/sliding-pill-tabs";

export interface SegmentedFilterOption {
  value: string;
  /** Translation key. */
  label: string;
  /** Leading dot, as on the design's "Today" segment. */
  dotColor?: string;
}

export interface SegmentedFilterRendererConfig {
  /** Search-param the selection is written to, so sibling renderers can read it
   * (see ListRenderer's `filterParam`) and the choice survives a reload. */
  param: string;
  options: SegmentedFilterOption[];
  /** Right-hand call to action. */
  cta?: { label: { name: string }; icon?: string; link: LinkRendererConfig };
}

/**
 * The design's rail header: a segmented Today/Week pill plus a CTA. Uses the
 * same `SlidingPillTabs` as the settings tab nav, so the selected pill slides
 * with the app's one motion curve instead of swapping backgrounds.
 */
export function SegmentedFilterRenderer({
  id,
  config: configProp,
}: {
  id: string;
  config?: SegmentedFilterRendererConfig;
}) {
  const configFromId = useConfiguration<SegmentedFilterRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id);
  const router = useRouter();
  const searchParams = useSearchParams();

  const fallback = config?.options[0]?.value ?? "";
  const fromUrl = config?.param ? searchParams.get(config.param) : null;
  const selected = config?.options.some((option) => option.value === fromUrl)
    ? (fromUrl as string)
    : fallback;

  const select = useCallback(
    (value: string) => {
      if (!config?.param) return;
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      params.set(config.param, value);
      router.push(`${window.location.pathname}?${params.toString()}`);
    },
    [config?.param, searchParams, router],
  );

  if (!config) return null;

  return (
    <Box
      sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}
    >
      <SlidingPillTabs
        items={config.options.map((option) => ({
          value: option.value,
          render: () =>
            option.dotColor ? (
              <>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: "999px",
                    background: option.dotColor,
                    flex: "none",
                  }}
                />
                {t(option.label)}
              </>
            ) : (
              t(option.label)
            ),
        }))}
        value={selected}
        onChange={select}
        tone="subtle"
      />

      {config.cta ? (
        <LinkRenderer config={config.cta.link}>
          <Button
            variant="contained"
            startIcon={
              config.cta.icon ? <IconRenderer name={config.cta.icon} size={14} /> : undefined
            }
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              p: "9px 15px",
              whiteSpace: "nowrap",
              "& .MuiButton-startIcon": { mr: "7px", ml: 0 },
            }}
          >
            {t(config.cta.label.name)}
          </Button>
        </LinkRenderer>
      ) : null}
    </Box>
  );
}
