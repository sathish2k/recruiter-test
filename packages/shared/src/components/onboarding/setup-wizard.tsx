"use client";

import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { WIZARD_WIDGETS } from "./wizard-widgets";

export interface WizardStage {
  name: string;
  clientVisible: boolean;
  kind?: "entry" | "middle" | "hire";
}

export interface WizardReason {
  category: "client" | "candidate" | "internal";
  label: string;
  active: boolean;
}

export interface WizardInvite {
  email: string;
  role: string;
}

export interface SetupState {
  timezone: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  setupStep: number;
  setupCompletedAt: string | null;
  stages: WizardStage[];
  reasons: WizardReason[];
  invites: WizardInvite[];
}

export interface SetupPatch {
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: string;
  setupStep?: number;
  completed?: boolean;
  stages?: { name: string; clientVisible: boolean }[];
  reasons?: WizardReason[];
  invites?: WizardInvite[];
}

interface WizardConfig {
  steps?: Record<string, JsonSchema>;
  roles?: string[];
  links?: Record<string, LinkRendererConfig>;
}

const STEP_KEYS = ["basics", "stages", "reasons", "team", "review"] as const;
type StepKey = (typeof STEP_KEYS)[number];

/** Which schema field holds each rejection category's active labels. */
const REASON_FIELD: Record<WizardReason["category"], string> = {
  client: "reasonsClient",
  candidate: "reasonsCandidate",
  internal: "reasonsInternal",
};

/**
 * The five-step workspace setup (flow §1.4). Each editable step is a
 * FormRenderer over a schema from configuration; this component owns only the
 * rail, the copy and where the buttons sit.
 *
 * Every step autosaves, including the step number, so closing the tab and
 * coming back resumes exactly here — the resume state lives on the server, not
 * in this browser.
 */
export function SetupWizard({
  id,
  state,
  onSave,
}: {
  id: string;
  state: SetupState;
  onSave: (patch: SetupPatch) => Promise<void>;
}) {
  const { t } = useTranslation(id);
  const config = useConfiguration<WizardConfig>(id);
  const router = usePortalRouter();
  const steps = config.steps ?? {};

  const [step, setStep] = useState(state.setupStep);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resumed, setResumed] = useState(state.setupStep > 0);
  /** The wizard is inert until the first payload lands. */
  const [ready, setReady] = useState(state.stages.length > 0);
  const entryStep = useRef(state.setupStep);
  const hydrated = useRef(false);
  const inFlight = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    if (hydrated.current || state.stages.length === 0) return;
    hydrated.current = true;
    setReady(true);
    setStep(state.setupStep);
    entryStep.current = state.setupStep;
    setResumed(state.setupStep > 0);
  }, [state]);

  /**
   * Saves run one at a time. Clicking through two steps faster than a
   * round-trip would otherwise leave two writes racing, and the later step
   * number is not reliably the one that lands last.
   */
  const save = (patch: SetupPatch) => {
    setSaving(true);
    const next = inFlight.current
      .catch(() => undefined)
      .then(() => onSave(patch))
      .finally(() => {
        if (inFlight.current === next) setSaving(false);
      });
    inFlight.current = next;
    return next;
  };

  const stepKey: StepKey = STEP_KEYS[step] ?? "basics";
  const schema = steps[stepKey];

  /** Seeds the current step's form from the workspace's saved state. */
  const defaultsFor = (key: StepKey): FormValues => {
    const props = steps[key]?.properties ?? {};
    if (key === "basics") {
      return {
        timezone: state.timezone,
        currency: state.currency,
        dateFormat: state.dateFormat,
        timeFormat: state.timeFormat,
      };
    }
    if (key === "stages") {
      return { stages: state.stages.map(({ name, clientVisible }) => ({ name, clientVisible })) };
    }
    if (key === "reasons") {
      const active = (category: WizardReason["category"]) =>
        state.reasons.filter((r) => r.category === category && r.active).map((r) => r.label);
      const known = new Set(
        Object.values(REASON_FIELD).flatMap((f) => (props[f]?.enum ?? []).map(String)),
      );
      return {
        reasonsClient: active("client"),
        reasonsCandidate: active("candidate"),
        reasonsInternal: active("internal"),
        // Anything the workspace added itself, which no group's enum lists.
        reasonsCustom: state.reasons.filter((r) => !known.has(r.label)).map((r) => r.label),
      };
    }
    if (key === "team") {
      // The step collects *new* invites and opens on one blank row. Invites
      // already out are reported as a count — they belong to Settings → Team,
      // and re-listing them here would put the whole workspace's history into
      // a five-minute setup step.
      const roles = (props.invites?.choices ?? []).map((choice) => choice.value);
      return { invites: [{ email: "", role: roles[2] ?? "Sourcer" }] };
    }
    return {};
  };

  /** Turns a step's form values into the patch the API takes. */
  const patchFor = (key: StepKey, values: FormValues): SetupPatch => {
    if (key === "basics") {
      return {
        timezone: String(values.timezone ?? ""),
        currency: String(values.currency ?? ""),
        dateFormat: String(values.dateFormat ?? ""),
        timeFormat: String(values.timeFormat ?? ""),
      };
    }
    if (key === "stages") {
      const rows = (values.stages ?? []) as { name: string; clientVisible?: boolean }[];
      return {
        stages: rows
          .filter((row) => row.name?.trim())
          .map((row) => ({ name: row.name.trim(), clientVisible: Boolean(row.clientVisible) })),
      };
    }
    if (key === "reasons") {
      const props = steps.reasons?.properties ?? {};
      const reasons: WizardReason[] = [];
      for (const [category, fieldName] of Object.entries(REASON_FIELD)) {
        const offered = (props[fieldName]?.enum ?? []).map(String);
        const on = new Set(((values[fieldName] ?? []) as string[]).map(String));
        for (const label of offered) {
          reasons.push({
            category: category as WizardReason["category"],
            label,
            active: on.has(label),
          });
        }
      }
      for (const label of (values.reasonsCustom ?? []) as string[]) {
        if (label.trim()) reasons.push({ category: "internal", label: label.trim(), active: true });
      }
      return { reasons };
    }
    if (key === "team") {
      const rows = (values.invites ?? []) as WizardInvite[];
      return {
        invites: rows
          .filter((row) => row.email?.trim())
          .map((row) => ({ email: row.email.trim(), role: row.role || "Sourcer" })),
      };
    }
    return {};
  };

  const move = async (target: number, values?: FormValues) => {
    if (!ready) return;
    const next = Math.max(0, Math.min(STEP_KEYS.length - 1, target));
    hydrated.current = true;
    setStep(next);
    setResumed(false);
    await save({ setupStep: next, ...(values ? patchFor(stepKey, values) : {}) });
  };

  const finish = async () => {
    if (!ready) return;
    await save({ setupStep: STEP_KEYS.length - 1, completed: true });
    const target = config.links?.dashboard?.routeId;
    if (target) router.push(target);
  };

  /** The footer the design puts below the panel, shared by every step. */
  const footer = (submitLabel: string, submits: boolean) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: "11px", mt: "20px", flexWrap: "wrap" }}>
      {step > 0 ? (
        <Button
          variant="outlined"
          disabled={!ready}
          data-testid="wizard-back"
          startIcon={<ArrowBackRounded />}
          onClick={() => void move(step - 1)}
        >
          {t("back")}
        </Button>
      ) : null}
      <Box sx={{ flex: 1 }} />
      {step < STEP_KEYS.length - 1 ? (
        <>
          <Button
            variant="text"
            disabled={!ready}
            data-testid="wizard-skip"
            // The design plays this down deliberately — skipping keeps the
            // defaults, so it must not compete with Continue.
            sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
            onClick={() => {
              setToast(t("skipped", { label: t(`steps.${stepKey}.label`).toLowerCase() }));
              void move(step + 1);
            }}
          >
            {t("skip")}
          </Button>
          <Button
            type={submits ? "submit" : "button"}
            variant="contained"
            disabled={!ready}
            data-testid="wizard-next"
            endIcon={<ArrowForwardRounded />}
            onClick={submits ? undefined : () => void move(step + 1)}
          >
            {t(submitLabel)}
          </Button>
        </>
      ) : (
        <Button
          variant="contained"
          disabled={!ready}
          data-testid="wizard-finish"
          startIcon={<RocketLaunchRounded />}
          onClick={() => void finish()}
        >
          {t("finish")}
        </Button>
      )}
    </Box>
  );

  const roleNotes = (
    <Box sx={{ mt: "18px", pt: "16px", borderTop: "1px solid", borderColor: "divider" }}>
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: ".07em",
          color: "text.disabled",
          mb: "9px",
        }}
      >
        {t("team.rolesHeading")}
      </Typography>
      {(config.roles ?? []).map((role) => (
        <Box key={role} sx={{ display: "flex", gap: "9px", fontSize: 11.5, mb: "9px" }}>
          <Box component="b" sx={{ width: 88, flex: "none", color: "text.primary" }}>
            {role}
          </Box>
          <Box component="span" sx={{ color: "text.disabled", lineHeight: 1.5 }}>
            {t(`team.roleNotes.${role.toLowerCase().replace(/\s+/g, "-")}`)}
          </Box>
        </Box>
      ))}
    </Box>
  );

  const panel = (children: ReactNode) => (
    <Card
      variant="base"
      data-testid="wizard-panel"
      sx={{
        borderRadius: "18px",
        p: "22px 24px",
        boxShadow: "var(--mui-palette-surface-menuShadow)",
      }}
    >
      {children}
    </Card>
  );

  return (
    <Box
      data-testid="setup-wizard"
      sx={{ position: "relative", zIndex: 1, maxWidth: 720, mx: "auto", p: "92px 24px 72px" }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 28,
          right: 24,
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <Typography
          data-testid="wizard-save-state"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: 11,
            color: "text.disabled",
          }}
        >
          <IconRenderer name="check-circle" size={13} />
          {saving ? t("saving") : t("saved")}
        </Typography>
        {config.links?.dashboard ? (
          <LinkRenderer
            config={{
              ...config.links.dashboard,
              text: t("later"),
              sx: { fontSize: 12.5, fontWeight: 600, color: "surface.primarySoftFg" },
            }}
          />
        ) : null}
      </Box>

      {resumed ? (
        <Card
          data-testid="wizard-resumed"
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "11px",
            bgcolor: "surface.warningSoftBg",
            border: "1px solid",
            borderColor: "surface.warningSoftBorder",
            borderRadius: "14px",
            p: "13px 16px",
            mb: "22px",
          }}
        >
          <Box sx={{ color: "surface.warningSoftFg", display: "flex", flex: "none" }}>
            <IconRenderer name="history" size={18} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, color: "surface.warningSoftFg" }}>
              {t("resume.title")}
            </Typography>
            <Typography sx={{ fontSize: 12, lineHeight: 1.55, color: "text.primary", mt: "3px" }}>
              {t("resume.body", {
                step: entryStep.current + 1,
                total: STEP_KEYS.length,
                label: t(`steps.${STEP_KEYS[entryStep.current] ?? "basics"}.label`).toLowerCase(),
              })}
            </Typography>
          </Box>
          <Button
            variant="text"
            size="small"
            disabled={!ready}
            data-testid="wizard-start-over"
            onClick={() => void move(0)}
          >
            {t("resume.startOver")}
          </Button>
        </Card>
      ) : null}

      <Typography
        data-testid="wizard-step-kicker"
        sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", color: "text.disabled" }}
      >
        {t("stepOf", { step: step + 1, total: STEP_KEYS.length })}
      </Typography>
      <Typography sx={{ fontSize: 27, fontWeight: 700, letterSpacing: "-.015em", mt: "7px" }}>
        {t(`steps.${stepKey}.title`)}
      </Typography>
      <Typography
        sx={{ fontSize: 14, lineHeight: 1.6, color: "text.secondary", mt: "8px", maxWidth: 560 }}
      >
        {t(`steps.${stepKey}.blurb`)}
      </Typography>

      <Box
        data-testid="wizard-rail"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "7px",
          m: "24px 0 22px",
          flexWrap: "wrap",
        }}
      >
        {STEP_KEYS.map((key, index) => (
          <RailChip
            key={key}
            stepKey={key}
            label={t(`steps.${key}.label`)}
            index={index}
            current={step}
            onClick={() => index <= step && void move(index)}
          />
        ))}
      </Box>

      {schema && !ready ? (
        <>
          {panel(
            <Box sx={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              {[0, 1, 2].map((row) => (
                <Skeleton key={row} variant="rounded" height={56} />
              ))}
            </Box>,
          )}
          {footer("next", false)}
        </>
      ) : schema ? (
        <FormRenderer
          // Remounting per step is deliberate: each step is its own form with
          // its own defaults, and carrying state across them would be wrong.
          // react-hook-form reads defaultValues once, so the form must not
          // mount before the workspace's own values have arrived — hence the
          // `ready` gate above rather than a key that changes under it.
          key={stepKey}
          id={id}
          schema={schema}
          defaultValues={defaultsFor(stepKey)}
          // A grid, not a stack, so a schema can put two short fields on one
          // row (date and time format) — everything else defaults to full width.
          gridContainer={{ columns: 12, spacing: 2.75 }}
          widgets={WIZARD_WIDGETS}
          onSubmit={(values) => move(step + 1, values)}
          wrapFields={(fields) =>
            panel(
              <>
                {fields}
                {stepKey === "team" ? roleNotes : null}
              </>,
            )
          }
          actions={() => footer(step === 3 ? "nextInvites" : "next", true)}
        />
      ) : (
        <>
          {panel(<ReviewStep id={id} state={state} onChange={(target) => void move(target)} />)}
          {footer("finish", false)}
        </>
      )}

      <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "14px", textAlign: "center" }}>
        {step === STEP_KEYS.length - 1 ? t("footNote.last") : t("footNote.default")}
      </Typography>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={2400}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}

/** The final step: what the other four saved, each with a way back to it. */
function ReviewStep({
  id,
  state,
  onChange,
}: {
  id: string;
  state: SetupState;
  onChange: (target: number) => void;
}) {
  const { t } = useTranslation(id);
  const activeReasons = state.reasons.filter((reason) => reason.active).length;
  const rows = [
    {
      label: t("review.basics"),
      value: [state.timezone, state.currency, state.dateFormat, state.timeFormat]
        .filter(Boolean)
        .join(" · "),
      target: 0,
    },
    {
      label: t("review.stages", { count: state.stages.length }),
      value: state.stages.map((stage) => stage.name).join(" → "),
      target: 1,
    },
    {
      label: t("review.reasons", { count: activeReasons }),
      value: t("review.reasonsValue"),
      target: 2,
    },
    {
      label: state.invites.length
        ? t("review.invites", { count: state.invites.length })
        : t("review.noInvites"),
      value: state.invites.length
        ? state.invites
            .map((invite) => `${invite.email.split("@")[0]} as ${invite.role}`)
            .join(", ")
        : t("review.noInvitesValue"),
      target: 3,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {rows.map((row) => (
        <Card
          key={row.label}
          variant="inset"
          data-testid={`review-row-${row.target}`}
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
            borderRadius: "13px",
            p: "13px 15px",
          }}
        >
          <CheckCircleRounded sx={{ fontSize: 18, color: "surface.successFg", flex: "none" }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{row.label}</Typography>
            <Typography sx={{ fontSize: 12, lineHeight: 1.55, color: "text.secondary", mt: "3px" }}>
              {row.value}
            </Typography>
          </Box>
          <Button variant="text" size="small" onClick={() => onChange(row.target)}>
            {t("review.change")}
          </Button>
        </Card>
      ))}
      <Card
        variant="inset"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "9px",
          bgcolor: "surface.successSoftBg",
          borderColor: "surface.successSoftBorder",
          borderRadius: "12px",
        }}
      >
        <Box sx={{ color: "surface.successFg", display: "flex", flex: "none" }}>
          <IconRenderer name="check-circle" size={16} />
        </Box>
        <Typography sx={{ fontSize: 11.5, lineHeight: 1.55, color: "text.secondary" }}>
          {t("review.note")}
        </Typography>
      </Card>
    </Box>
  );
}

function RailChip({
  stepKey,
  label,
  index,
  current,
  onClick,
}: {
  stepKey: string;
  label: string;
  index: number;
  current: number;
  onClick: () => void;
}) {
  const done = index < current;
  const active = index === current;
  return (
    <Box
      onClick={onClick}
      data-testid={`wizard-rail-${stepKey}`}
      data-state={active ? "current" : done ? "done" : "upcoming"}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        borderRadius: "999px",
        p: "6px 13px 6px 8px",
        cursor: index <= current ? "pointer" : "default",
        bgcolor: active
          ? "surface.primarySoftBg"
          : done
            ? "surface.successSoftBg"
            : "background.paper",
        border: "1px solid",
        borderColor: active
          ? "surface.primarySoftBorder"
          : done
            ? "surface.successSoftBorder"
            : "divider",
        color: active ? "surface.primarySoftFg" : done ? "surface.successFg" : "text.disabled",
      }}
    >
      <Box
        sx={{
          width: 19,
          height: 19,
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          flex: "none",
          bgcolor: active ? "primary.main" : done ? "surface.successSoftBg" : "surface.neutral",
          color: active ? "primary.contrastText" : "inherit",
        }}
      >
        {done ? "✓" : index + 1}
      </Box>
      <Typography sx={{ fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap", color: "inherit" }}>
        {label}
      </Typography>
    </Box>
  );
}
