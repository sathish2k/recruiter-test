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
import { useConfiguration, useTranslation } from "@recruit/sdk";
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
  /** Cards offered on the confirmation screen once the workspace exists. */
  doneActions?: readonly {
    key: string;
    icon: string;
    tone: "primary" | "success" | "info" | "warning";
    routeId: string;
  }[];
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
  const steps = config.steps ?? {};

  const [step, setStep] = useState(state.setupStep);
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [resumed, setResumed] = useState(state.setupStep > 0);
  const [created, setCreated] = useState(false);
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
    setCreated(true);
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
          sx={{ minHeight: 44, px: "18px" }}
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
            size="large"
            sx={{ px: "24px" }}
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
          size="large"
          sx={{ px: "26px" }}
          startIcon={<RocketLaunchRounded />}
          onClick={() => void finish()}
        >
          {t("finish")}
        </Button>
      )}
    </Box>
  );

  const roleNotes = (
    <Box sx={{ mt: "18px", pt: "16px", borderTop: "1px dashed", borderColor: "divider" }}>
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
    <Card variant="base" data-testid="wizard-panel" sx={{ borderRadius: "16px", p: "26px 28px" }}>
      {children}
    </Card>
  );

  const doneActions = config.doneActions ?? [];

  return (
    <Box data-testid="setup-wizard" sx={{ position: "relative", zIndex: 1 }}>
      {/* The design gives the wizard its own bar: the mark on the left, the
          autosave state and the leave-for-now escape on the right. */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "16px",
          p: "26px 32px",
        }}
      >
        {/* The lockup is drawn once, by the auth backdrop this route sits on —
            the bar only carries the right-hand group. */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Typography
            data-testid="wizard-save-state"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              fontSize: 12,
              color: "text.secondary",
            }}
          >
            <IconRenderer name="cloud-done" size={17} />
            {saving ? t("saving") : t("saved")}
          </Typography>
          {config.links?.dashboard ? (
            <LinkRenderer
              config={{
                ...config.links.dashboard,
                text: t("later"),
                sx: { fontSize: 12.5, fontWeight: 700, color: "surface.linkFg" },
              }}
            />
          ) : null}
        </Box>
      </Box>

      {created ? (
        <Box sx={{ maxWidth: 820, mx: "auto", p: "40px 24px 80px" }}>
          <Card
            variant="base"
            data-testid="wizard-created"
            sx={{ borderRadius: "16px", p: "44px 44px 36px", textAlign: "center" }}
          >
            <Box
              sx={{
                width: 76,
                height: 76,
                mx: "auto",
                borderRadius: "999px",
                bgcolor: "surface.successSoftBg",
                color: "surface.successFg",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconRenderer name="check" size={40} color="inherit" />
            </Box>
            <Typography
              sx={{
                fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: "-.02em",
                mt: "20px",
              }}
            >
              {t("created.title")}
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                lineHeight: 1.65,
                color: "text.secondary",
                mt: "8px",
                maxWidth: 520,
                mx: "auto",
                textWrap: "pretty",
              }}
            >
              {t("created.blurb")}
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(216px,1fr))",
                gap: "12px",
                mt: "30px",
                textAlign: "left",
              }}
            >
              {doneActions.map((action) => (
                <LinkRenderer
                  key={action.key}
                  config={{ routeId: action.routeId, underline: "none" }}
                >
                  <Card
                    variant="inset"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "9px",
                      p: "18px",
                      height: "100%",
                      border: "1px solid transparent",
                      cursor: "pointer",
                      transition: "var(--recruit-motion-state)",
                      "&:hover": { borderColor: "primary.main", bgcolor: "surface.hover" },
                    }}
                  >
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "9px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flex: "none",
                        bgcolor: `surface.${action.tone}SoftBg`,
                        color:
                          action.tone === "primary"
                            ? "surface.primarySoftFg"
                            : `surface.${action.tone}Fg`,
                      }}
                    >
                      <IconRenderer name={action.icon} size={19} color="inherit" />
                    </Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: "text.primary" }}>
                      {t(`created.actions.${action.key}.title`)}
                    </Typography>
                    <Typography sx={{ fontSize: 12, lineHeight: 1.6, color: "text.secondary" }}>
                      {t(`created.actions.${action.key}.detail`)}
                    </Typography>
                  </Card>
                </LinkRenderer>
              ))}
            </Box>

            {config.links?.dashboard ? (
              <LinkRenderer config={config.links.dashboard}>
                <Button
                  variant="contained"
                  size="large"
                  data-testid="wizard-created-cta"
                  endIcon={<ArrowForwardRounded />}
                  sx={{ mt: "26px", px: "26px" }}
                >
                  {t("created.cta")}
                </Button>
              </LinkRenderer>
            ) : null}
            <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "14px" }}>
              {t("created.foot")}
            </Typography>
          </Card>
        </Box>
      ) : (
        <Box sx={{ maxWidth: 880, mx: "auto", p: "14px 24px 72px" }}>
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
                <Typography
                  sx={{ fontSize: 12, lineHeight: 1.55, color: "text.primary", mt: "3px" }}
                >
                  {t("resume.body", {
                    step: entryStep.current + 1,
                    total: STEP_KEYS.length,
                    label: t(
                      `steps.${STEP_KEYS[entryStep.current] ?? "basics"}.label`,
                    ).toLowerCase(),
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
            sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".09em", color: "text.secondary" }}
          >
            {t("stepOf", { step: step + 1, total: STEP_KEYS.length })}
          </Typography>
          <Typography
            sx={{
              fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-.02em",
              mt: "8px",
              textWrap: "pretty",
            }}
          >
            {t(`steps.${stepKey}.title`)}
          </Typography>
          <Typography
            sx={{
              fontSize: 14,
              lineHeight: 1.6,
              color: "text.secondary",
              mt: "8px",
              maxWidth: 640,
            }}
          >
            {t(`steps.${stepKey}.blurb`)}
          </Typography>

          <Box
            data-testid="wizard-rail"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              m: "22px 0 20px",
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

          <Typography
            sx={{ fontSize: 11.5, color: "text.disabled", mt: "14px", textAlign: "center" }}
          >
            {step === STEP_KEYS.length - 1 ? t("footNote.last") : t("footNote.default")}
          </Typography>
        </Box>
      )}

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
        gap: "8px",
        height: 38,
        px: "14px",
        borderRadius: "8px",
        cursor: index <= current ? "pointer" : "default",
        bgcolor: active ? "surface.primarySoftBg" : done ? "surface.successSoftBg" : "transparent",
        border: "1px solid",
        borderColor: active
          ? "surface.primarySoftBorder"
          : done
            ? "surface.successSoftBorder"
            : "surface.border",
        color: active ? "surface.primarySoftFg" : done ? "surface.successFg" : "text.secondary",
        transition: "var(--recruit-motion-state)",
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: "999px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10.5,
          fontWeight: 700,
          flex: "none",
          bgcolor: active ? "primary.main" : done ? "surface.successFg" : "surface.neutral",
          color: active || done ? "primary.contrastText" : "text.secondary",
        }}
      >
        {done ? <IconRenderer name="check" size={14} color="inherit" /> : index + 1}
      </Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", color: "inherit" }}>
        {label}
      </Typography>
    </Box>
  );
}
