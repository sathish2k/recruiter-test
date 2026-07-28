"use client";

import CelebrationRounded from "@mui/icons-material/CelebrationRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "../renderers";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";

export interface ChecklistStep {
  key: string;
  done: boolean;
}

export interface OnboardingChecklist {
  steps: ChecklistStep[];
  doneCount: number;
  total: number;
  allDone: boolean;
  configured: boolean;
  workspaceName: string;
}

interface GetStartedConfig {
  /** Keyed by step key — the CTA target for each row. */
  links?: Record<string, LinkRendererConfig>;
}

/**
 * The Get Started checklist. Every row's done state comes from the workspace's
 * real contents, so the ticks are not clickable — a step is done when the thing
 * it asks for exists, and there is nothing useful to toggle.
 */
export function GetStarted({
  id,
  checklist,
  firstName,
}: {
  id: string;
  checklist: OnboardingChecklist;
  firstName?: string;
}) {
  const { t } = useTranslation(id);
  const { links } = useConfiguration<GetStartedConfig>(id);
  const { steps, doneCount, total, allDone } = checklist;

  return (
    <Box
      sx={{
        position: "relative",
        zIndex: 1,
        maxWidth: 660,
        mx: "auto",
        p: "92px 24px 64px",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 28,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: "9px",
        }}
      >
        {links?.skip ? (
          <LinkRenderer
            config={{
              ...links.skip,
              text: t("skip"),
              sx: { fontSize: 12.5, fontWeight: 600, color: "surface.primarySoftFg" },
            }}
          />
        ) : null}
      </Box>

      <Typography sx={{ fontSize: 28, fontWeight: 700, letterSpacing: "-.015em" }}>
        {firstName ? t("title", { name: firstName }) : t("titleNoName")}
      </Typography>
      <Typography sx={{ fontSize: 14, color: "text.secondary", mt: "8px" }}>
        {t("subtitle")}{" "}
        <Box component="b" sx={{ color: "text.primary" }}>
          {t("progress", { done: doneCount, total })}
        </Box>
        .
      </Typography>

      <Box
        sx={{
          height: 8,
          borderRadius: "999px",
          bgcolor: "surface.track",
          m: "20px 0 26px",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: `${(doneCount / Math.max(total, 1)) * 100}%`,
            background: "linear-gradient(90deg,#FF8A3C,#E4560F)",
            borderRadius: "999px",
            transition: "width .25s",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "11px" }}>
        {steps.map((step) => (
          <StepRow key={step.key} step={step} link={links?.[step.key]} t={t} />
        ))}
      </Box>

      {allDone ? (
        <Card
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "13px",
            background:
              "linear-gradient(135deg,var(--mui-palette-surface-successSoftBg),var(--mui-palette-background-paper))",
            border: "1px solid",
            borderColor: "surface.successSoftBorder",
            borderRadius: "16px",
            p: "16px 18px",
            mt: "14px",
          }}
        >
          <CelebrationRounded sx={{ fontSize: 26, color: "surface.successFg" }} />
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t("ready.title")}</Typography>
            <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
              {t("ready.subtitle")}
            </Typography>
          </Box>
          {links?.dashboard ? (
            <LinkRenderer config={links.dashboard}>
              <Button variant="contained">{t("ready.cta")}</Button>
            </LinkRenderer>
          ) : null}
        </Card>
      ) : null}

      {links?.setup ? (
        <LinkRenderer config={links.setup}>
          <Card
            variant="interactive"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              mt: "22px",
              borderRadius: "14px",
              p: "14px 16px",
            }}
          >
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "10px",
                bgcolor: "surface.primarySoftBg",
                border: "1px solid",
                borderColor: "surface.primarySoftBorder",
                color: "surface.accentBright",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flex: "none",
              }}
            >
              <IconRenderer name="settings" size={17} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: "text.primary" }}>
                {t("configure.title")}
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}>
                {t("configure.subtitle")}
              </Typography>
            </Box>
            <Box sx={{ color: "text.disabled", display: "flex", flex: "none" }}>
              <IconRenderer name="arrow-forward" size={18} />
            </Box>
          </Card>
        </LinkRenderer>
      ) : null}

      <Typography
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          mt: "22px",
          fontSize: 12,
          color: "text.disabled",
        }}
      >
        {t("tip")}
      </Typography>
    </Box>
  );
}

function StepRow({
  step,
  link,
  t,
}: {
  step: ChecklistStep;
  link?: LinkRendererConfig;
  t: (key: string, fallback?: string | Record<string, unknown>) => string;
}) {
  const done = step.done;
  return (
    <Card
      variant="base"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "14px",
        borderRadius: "16px",
        p: "16px 18px",
        ...(done && {
          bgcolor: "surface.successSoftBg",
          borderColor: "surface.successSoftBorder",
        }),
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: "999px",
          bgcolor: done ? "success.main" : "transparent",
          border: "2px solid",
          borderColor: done ? "success.main" : "surface.controlOutline",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        {done ? <CheckRounded sx={{ fontSize: 17, color: "background.default" }} /> : null}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 14,
            fontWeight: 700,
            ...(done && { textDecoration: "line-through", color: "text.secondary" }),
          }}
        >
          {t(`steps.${step.key}.title`)}
        </Typography>
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
          {t(`steps.${step.key}.subtitle`)}
        </Typography>
      </Box>
      {link ? (
        <LinkRenderer config={link}>
          <Button
            variant="outlined"
            size="small"
            endIcon={<IconRenderer name="arrow-forward" size={14} />}
          >
            {t(`steps.${step.key}.cta`)}
          </Button>
        </LinkRenderer>
      ) : null}
    </Card>
  );
}
