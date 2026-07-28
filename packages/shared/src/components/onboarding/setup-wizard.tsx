"use client";

import AddRounded from "@mui/icons-material/AddRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import KeyboardArrowDownRounded from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowUpRounded from "@mui/icons-material/KeyboardArrowUpRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import PersonAddRounded from "@mui/icons-material/PersonAddRounded";
import RadioButtonUncheckedRounded from "@mui/icons-material/RadioButtonUncheckedRounded";
import RocketLaunchRounded from "@mui/icons-material/RocketLaunchRounded";
import UnfoldMoreRounded from "@mui/icons-material/UnfoldMoreRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import InputBase from "@mui/material/InputBase";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import { useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import { useEffect, useRef, useState } from "react";
import { IconRenderer } from "../renderers";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";

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
  setupStep?: number;
  completed?: boolean;
  stages?: { name: string; clientVisible: boolean }[];
  reasons?: WizardReason[];
  invites?: WizardInvite[];
}

interface WizardOption {
  value: string;
  label: string;
  /** Right-hand detail — the zone's offset, or the format's sample date. */
  meta?: string;
  /** Currency symbol. */
  symbol?: string;
}

interface WizardConfig {
  timezones?: WizardOption[];
  currencies?: WizardOption[];
  dateFormats?: WizardOption[];
  roles?: string[];
  links?: Record<string, LinkRendererConfig>;
}

const STEP_KEYS = ["basics", "stages", "reasons", "team", "review"] as const;
const REASON_CATEGORIES: WizardReason["category"][] = ["client", "candidate", "internal"];
const CATEGORY_ICON: Record<WizardReason["category"], string> = {
  client: "domain",
  candidate: "person",
  internal: "filter",
};
/** The design gives each rejection group its own tone. */
const CATEGORY_COLOR: Record<WizardReason["category"], string> = {
  client: "surface.accentBright",
  candidate: "surface.successFg",
  internal: "surface.infoFg",
};

function offsetOf(zone: string): number | null {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone,
      timeZoneName: "longOffset",
    }).formatToParts(new Date());
    const name = parts.find((part) => part.type === "timeZoneName")?.value ?? "";
    const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
    if (!match) return 0;
    const sign = match[1] === "-" ? -1 : 1;
    return sign * (Number(match[2]) * 60 + Number(match[3]));
  } catch {
    return null;
  }
}

/**
 * Zone ids are not unique — the runtime may store `Asia/Calcutta` where the
 * picker offers `Asia/Kolkata`, and which spelling is canonical depends on the
 * host's ICU data. Comparing current offsets matches either way.
 */
function sameZone(a: string, b: string): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const left = offsetOf(a);
  return left !== null && left === offsetOf(b);
}

/** The stored value, or the first offered one when it isn't on the list. */
function offered(value: string, options: WizardOption[] | undefined): string {
  if (!options?.length) return value;
  if (options.some((option) => option.value === value)) return value;
  return options[0]?.value ?? value;
}

/**
 * The five-step workspace setup (flow §1.4). Every step autosaves, including
 * the step number, so closing the tab and coming back resumes exactly here —
 * the resume state lives on the server, not in this browser.
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
  const roles = config.roles ?? ["Admin", "Profile lead", "Sourcer", "Finance"];

  const [step, setStep] = useState(state.setupStep);
  const [timezone, setTimezone] = useState(state.timezone);
  const [currency, setCurrency] = useState(state.currency);
  const [dateFormat, setDateFormat] = useState(state.dateFormat);
  const [stages, setStages] = useState<WizardStage[]>(state.stages);
  const [reasons, setReasons] = useState<WizardReason[]>(state.reasons);
  // The rows collect *new* invites. Invites already out are reported as a count
  // below — they belong to Settings → Team, and re-listing them here would put
  // the whole workspace's history into a five-minute setup step.
  const [invites, setInvites] = useState<WizardInvite[]>([
    { email: "", role: roles[2] ?? "Sourcer" },
  ]);
  const [newReason, setNewReason] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  /** True only when the server said we were mid-setup on arrival. */
  const [resumed, setResumed] = useState(state.setupStep > 0);
  const entryStep = useRef(state.setupStep);
  const hydrated = useRef(false);

  // Seed from the server exactly once, when the first real payload lands. The
  // wizard owns the edited copy after that — a later revalidation must not
  // overwrite what the user is part-way through typing.
  useEffect(() => {
    if (hydrated.current || state.stages.length === 0) return;
    hydrated.current = true;
    setStep(state.setupStep);
    // Snap each stored value onto the option this screen actually offers, so
    // the picker always shows the workspace's current answer as selected.
    setTimezone(
      config.timezones?.find((option) => sameZone(option.value, state.timezone))?.value ??
        offered(state.timezone, config.timezones),
    );
    setCurrency(offered(state.currency, config.currencies));
    setDateFormat(offered(state.dateFormat, config.dateFormats));
    setStages(state.stages);
    setReasons(state.reasons);
    entryStep.current = state.setupStep;
    setResumed(state.setupStep > 0);
  }, [state, config]);

  const activeReasons = reasons.filter((reason) => reason.active).length;
  const filledInvites = invites.filter((invite) => invite.email.trim());

  const save = async (patch: SetupPatch) => {
    setSaving(true);
    try {
      await onSave(patch);
    } finally {
      setSaving(false);
    }
  };

  /** Persists the current step's slice, then moves. */
  const goto = async (next: number) => {
    const target = Math.max(0, Math.min(STEP_KEYS.length - 1, next));
    setStep(target);
    setResumed(false);
    const patch: SetupPatch = { setupStep: target };
    if (step === 0) Object.assign(patch, { timezone, currency, dateFormat });
    if (step === 1)
      patch.stages = stages.map(({ name, clientVisible }) => ({ name, clientVisible }));
    if (step === 2) patch.reasons = reasons;
    if (step === 3) patch.invites = filledInvites;
    await save(patch);
  };

  const finish = async () => {
    await save({ setupStep: STEP_KEYS.length - 1, completed: true });
    const target = config.links?.dashboard?.routeId;
    if (target) router.push(target);
  };

  const stepKey = STEP_KEYS[step] ?? "basics";

  return (
    <Box sx={{ position: "relative", zIndex: 1, maxWidth: 720, mx: "auto", p: "92px 24px 72px" }}>
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
          <Button variant="text" size="small" onClick={() => void goto(0)}>
            {t("resume.startOver")}
          </Button>
        </Card>
      ) : null}

      <Typography
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
            label={t(`steps.${key}.label`)}
            index={index}
            current={step}
            onClick={() => index <= step && void goto(index)}
          />
        ))}
      </Box>

      <Card
        variant="base"
        sx={{
          borderRadius: "18px",
          p: "22px 24px",
          boxShadow: "var(--mui-palette-surface-menuShadow)",
        }}
      >
        {stepKey === "basics" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <Section title={t("basics.timezone.title")} hint={t("basics.timezone.hint")}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(config.timezones ?? []).map((option) => (
                  <PillOption
                    key={option.value}
                    selected={timezone === option.value}
                    onClick={() => setTimezone(option.value)}
                  >
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{option.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                      {option.meta}
                    </Typography>
                  </PillOption>
                ))}
              </Box>
              <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "9px" }}>
                {t("basics.timezone.more")}
              </Typography>
            </Section>
            <Divider />
            <Section title={t("basics.currency.title")} hint={t("basics.currency.hint")}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(config.currencies ?? []).map((option) => (
                  <PillOption
                    key={option.value}
                    selected={currency === option.value}
                    onClick={() => setCurrency(option.value)}
                  >
                    <Typography
                      sx={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: currency === option.value ? "surface.accentBright" : "text.disabled",
                      }}
                    >
                      {option.symbol}
                    </Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{option.label}</Typography>
                  </PillOption>
                ))}
              </Box>
              <Card
                variant="inset"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  bgcolor: "surface.warningSoftBg",
                  borderColor: "surface.warningSoftBorder",
                  mt: "11px",
                }}
              >
                <Box sx={{ color: "surface.warningSoftFg", display: "flex", flex: "none" }}>
                  <IconRenderer name="info" size={14} />
                </Box>
                <Typography sx={{ fontSize: 11, lineHeight: 1.5, color: "text.secondary" }}>
                  {t("basics.currency.warning")}
                </Typography>
              </Card>
            </Section>
            <Divider />
            <Section title={t("basics.dateFormat.title")}>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {(config.dateFormats ?? []).map((option) => (
                  <PillOption
                    key={option.value}
                    selected={dateFormat === option.value}
                    onClick={() => setDateFormat(option.value)}
                    sx={{
                      flexDirection: "column",
                      alignItems: "flex-start",
                      gap: "2px",
                      borderRadius: "12px",
                      p: "9px 15px",
                      minWidth: 118,
                    }}
                  >
                    <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>{option.label}</Typography>
                    <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                      {option.meta}
                    </Typography>
                  </PillOption>
                ))}
              </Box>
            </Section>
          </Box>
        ) : null}

        {stepKey === "stages" ? <StagesStep stages={stages} setStages={setStages} t={t} /> : null}

        {stepKey === "reasons" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  color: "text.disabled",
                }}
              >
                {t("reasons.active", { count: activeReasons })}
              </Typography>
              <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                {t("reasons.untick")}
              </Typography>
            </Box>
            {REASON_CATEGORIES.map((category) => (
              <Box key={category}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "9px" }}>
                  <Box sx={{ display: "flex", color: CATEGORY_COLOR[category] }}>
                    <IconRenderer name={CATEGORY_ICON[category]} size={16} />
                  </Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {t(`reasons.groups.${category}.label`)}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: "text.disabled" }}>
                    {t(`reasons.groups.${category}.hint`)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                  {reasons
                    .filter((reason) => reason.category === category)
                    .map((reason) => (
                      <Box
                        key={`${reason.category}-${reason.label}`}
                        onClick={() =>
                          setReasons((all) =>
                            all.map((row) =>
                              row === reason ? { ...row, active: !row.active } : row,
                            ),
                          )
                        }
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          borderRadius: "999px",
                          p: "6px 13px",
                          cursor: "pointer",
                          bgcolor: reason.active ? "surface.successSoftBg" : "surface.inset",
                          border: "1px solid",
                          borderColor: reason.active ? "surface.successSoftBorder" : "divider",
                          color: reason.active ? "text.primary" : "text.disabled",
                        }}
                      >
                        {reason.active ? (
                          <CheckCircleRounded sx={{ fontSize: 14, color: "surface.successFg" }} />
                        ) : (
                          <RadioButtonUncheckedRounded
                            sx={{ fontSize: 14, color: "text.disabled" }}
                          />
                        )}
                        <Typography sx={{ fontSize: 12 }}>{reason.label}</Typography>
                      </Box>
                    ))}
                </Box>
              </Box>
            ))}
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, mb: "7px" }}>
                {t("reasons.addOwn")}
              </Typography>
              <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <InsetInput
                  value={newReason}
                  placeholder={t("reasons.placeholder")}
                  onChange={setNewReason}
                  onEnter={() => {
                    if (!newReason.trim()) return;
                    setReasons((all) => [
                      ...all,
                      { category: "internal", label: newReason.trim(), active: true },
                    ]);
                    setToast(t("reasons.added", { label: newReason.trim() }));
                    setNewReason("");
                  }}
                  sx={{ flex: 1, minWidth: 200 }}
                />
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={!newReason.trim()}
                  startIcon={<AddRounded />}
                  onClick={() => {
                    setReasons((all) => [
                      ...all,
                      { category: "internal", label: newReason.trim(), active: true },
                    ]);
                    setToast(t("reasons.added", { label: newReason.trim() }));
                    setNewReason("");
                  }}
                >
                  {t("reasons.add")}
                </Button>
              </Box>
              <Typography sx={{ fontSize: 11, color: "text.disabled", mt: "8px" }}>
                {t("reasons.why")}
              </Typography>
            </Box>
          </Box>
        ) : null}

        {stepKey === "team" ? (
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                mb: "14px",
              }}
            >
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: ".07em",
                  color: "text.disabled",
                }}
              >
                {t("team.heading")}
              </Typography>
              {state.invites.length > 0 ? (
                <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>
                  {t("team.alreadyOut", { count: state.invites.length })}
                </Typography>
              ) : null}
            </Box>
            <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {invites.map((invite, index) => (
                <Card
                  // Rows are positional and editable, so the index is the identity.
                  // biome-ignore lint/suspicious/noArrayIndexKey: positional row
                  key={index}
                  variant="inset"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 150px 30px",
                    gap: "10px",
                    alignItems: "center",
                    borderRadius: "12px",
                    p: "9px 12px",
                  }}
                >
                  <InsetInput
                    value={invite.email}
                    placeholder={t("team.emailPlaceholder")}
                    bare
                    onChange={(value) =>
                      setInvites((all) =>
                        all.map((row, i) => (i === index ? { ...row, email: value } : row)),
                      )
                    }
                  />
                  <Box
                    onClick={() =>
                      setInvites((all) =>
                        all.map((row, i) =>
                          i === index
                            ? {
                                ...row,
                                role:
                                  roles[(roles.indexOf(row.role) + 1) % roles.length] ?? row.role,
                              }
                            : row,
                        ),
                      )
                    }
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "6px",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "surface.controlBorder",
                      borderRadius: "9px",
                      p: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    <Typography sx={{ fontSize: 11.5, fontWeight: 600 }}>{invite.role}</Typography>
                    <UnfoldMoreRounded sx={{ fontSize: 14, color: "text.disabled" }} />
                  </Box>
                  <Box
                    onClick={() => setInvites((all) => all.filter((_, i) => i !== index))}
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "text.disabled",
                      "&:hover": { color: "error.main" },
                    }}
                  >
                    <CloseRounded sx={{ fontSize: 16 }} />
                  </Box>
                </Card>
              ))}
            </Box>
            <Button
              variant="outlined"
              startIcon={<PersonAddRounded />}
              sx={{ mt: "12px", borderStyle: "dashed" }}
              onClick={() =>
                setInvites((all) => [...all, { email: "", role: roles[2] ?? "Sourcer" }])
              }
            >
              {t("team.addAnother")}
            </Button>
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
              {roles.map((role) => (
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
          </Box>
        ) : null}

        {stepKey === "review" ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              {
                label: t("review.basics"),
                value: [timezone, currency, dateFormat].filter(Boolean).join(" · "),
                target: 0,
              },
              {
                label: t("review.stages", { count: stages.length }),
                value: stages.map((stage) => stage.name).join(" → "),
                target: 1,
              },
              {
                label: t("review.reasons", { count: activeReasons }),
                value: t("review.reasonsValue"),
                target: 2,
              },
              {
                label: filledInvites.length
                  ? t("review.invites", { count: filledInvites.length })
                  : t("review.noInvites"),
                value: filledInvites.length
                  ? filledInvites
                      .map((invite) => `${invite.email.split("@")[0]} as ${invite.role}`)
                      .join(", ")
                  : t("review.noInvitesValue"),
                target: 3,
              },
            ].map((row) => (
              <Card
                key={row.label}
                variant="inset"
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  borderRadius: "13px",
                  p: "13px 15px",
                }}
              >
                <CheckCircleRounded
                  sx={{ fontSize: 18, color: "surface.successFg", flex: "none" }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>{row.label}</Typography>
                  <Typography
                    sx={{ fontSize: 12, lineHeight: 1.55, color: "text.secondary", mt: "3px" }}
                  >
                    {row.value}
                  </Typography>
                </Box>
                <Button variant="text" size="small" onClick={() => void goto(row.target)}>
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
        ) : null}
      </Card>

      <Box
        sx={{ display: "flex", alignItems: "center", gap: "11px", mt: "20px", flexWrap: "wrap" }}
      >
        {step > 0 ? (
          <Button
            variant="outlined"
            startIcon={<ArrowBackRounded />}
            onClick={() => void goto(step - 1)}
          >
            {t("back")}
          </Button>
        ) : null}
        <Box sx={{ flex: 1 }} />
        {step < STEP_KEYS.length - 1 ? (
          <>
            <Button
              variant="text"
              // The design plays this down deliberately — skipping keeps the
              // defaults, so it must not compete with Continue.
              sx={{ color: "text.disabled", "&:hover": { color: "text.primary" } }}
              onClick={() => {
                setToast(t("skipped", { label: t(`steps.${stepKey}.label`).toLowerCase() }));
                void goto(step + 1);
              }}
            >
              {t("skip")}
            </Button>
            <Button
              variant="contained"
              endIcon={<ArrowForwardRounded />}
              onClick={() => void goto(step + 1)}
            >
              {step === 3 ? t("nextInvites") : t("next")}
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<RocketLaunchRounded />}
            onClick={() => void finish()}
          >
            {t("finish")}
          </Button>
        )}
      </Box>

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

/** Stage list — rename, reorder, toggle client visibility, add and remove. */
function StagesStep({
  stages,
  setStages,
  t,
}: {
  stages: WizardStage[];
  setStages: (update: (all: WizardStage[]) => WizardStage[]) => void;
  t: (key: string, fallback?: string | Record<string, unknown>) => string;
}) {
  const swap = (from: number, to: number) =>
    setStages((all) => {
      const next = all.slice();
      const moved = next[from];
      const other = next[to];
      if (!moved || !other) return all;
      next[from] = other;
      next[to] = moved;
      return next;
    });

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          flexWrap: "wrap",
          mb: "14px",
        }}
      >
        <Typography
          sx={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", color: "text.disabled" }}
        >
          {t("stages.heading", { count: stages.length })}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{t("stages.eyeHint")}</Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {stages.map((stage, index) => {
          const fixed = index === 0 || index === stages.length - 1;
          const canUp = index > 1;
          const canDown = index > 0 && index < stages.length - 2;
          return (
            <Card
              // Positional, renameable rows — the index is the stable identity.
              // biome-ignore lint/suspicious/noArrayIndexKey: positional row
              key={index}
              variant="inset"
              data-stage-row={index}
              sx={{
                display: "grid",
                gridTemplateColumns: "26px 1fr 96px 62px 30px",
                gap: "10px",
                alignItems: "center",
                borderRadius: "12px",
                p: "9px 12px",
              }}
            >
              <Typography
                sx={{ fontSize: 11, fontWeight: 700, color: "text.disabled", textAlign: "center" }}
              >
                {index + 1}
              </Typography>
              <InsetInput
                value={stage.name}
                placeholder={t("stages.namePlaceholder")}
                bare
                bold
                onChange={(value) =>
                  setStages((all) =>
                    all.map((row, i) => (i === index ? { ...row, name: value } : row)),
                  )
                }
              />
              <Box
                onClick={() =>
                  setStages((all) =>
                    all.map((row, i) =>
                      i === index ? { ...row, clientVisible: !row.clientVisible } : row,
                    ),
                  )
                }
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: 10.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: stage.clientVisible ? "surface.successFg" : "text.disabled",
                }}
              >
                {stage.clientVisible ? (
                  <VisibilityRounded sx={{ fontSize: 15 }} />
                ) : (
                  <VisibilityOffRounded sx={{ fontSize: 15 }} />
                )}
                {stage.clientVisible ? t("stages.client") : t("stages.internal")}
              </Box>
              <Box sx={{ display: "flex", gap: "2px", justifySelf: "center" }}>
                <KeyboardArrowUpRounded
                  onClick={() => canUp && swap(index, index - 1)}
                  sx={{
                    fontSize: 16,
                    color: canUp ? "text.secondary" : "surface.controlOutline",
                    cursor: canUp ? "pointer" : "default",
                  }}
                />
                <KeyboardArrowDownRounded
                  onClick={() => canDown && swap(index, index + 1)}
                  sx={{
                    fontSize: 16,
                    color: canDown ? "text.secondary" : "surface.controlOutline",
                    cursor: canDown ? "pointer" : "default",
                  }}
                />
              </Box>
              {fixed ? (
                <LockRounded
                  titleAccess={t("stages.fixed")}
                  sx={{ fontSize: 16, color: "surface.controlOutline", justifySelf: "center" }}
                />
              ) : (
                <CloseRounded
                  onClick={() => setStages((all) => all.filter((_, i) => i !== index))}
                  sx={{
                    fontSize: 16,
                    color: "text.disabled",
                    cursor: "pointer",
                    justifySelf: "center",
                    "&:hover": { color: "error.main" },
                  }}
                />
              )}
            </Card>
          );
        })}
      </Box>

      <Button
        variant="outlined"
        startIcon={<AddRounded />}
        sx={{ mt: "12px", borderStyle: "dashed" }}
        onClick={() =>
          setStages((all) => {
            const next = all.slice();
            next.splice(Math.max(next.length - 1, 0), 0, { name: "", clientVisible: false });
            return next;
          })
        }
      >
        {t("stages.add")}
      </Button>

      <Card
        variant="inset"
        sx={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          bgcolor: "surface.infoSoftBg",
          borderColor: "surface.infoSoftBorder",
          borderRadius: "11px",
          mt: "16px",
        }}
      >
        <Box sx={{ color: "surface.infoFg", display: "flex", flex: "none" }}>
          <IconRenderer name="info" size={15} />
        </Box>
        <Typography sx={{ fontSize: 11.5, lineHeight: 1.55, color: "text.secondary" }}>
          {t("stages.fixedNote", {
            first: stages[0]?.name ?? "",
            last: stages[stages.length - 1]?.name ?? "",
          })}
        </Typography>
      </Card>
    </Box>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Box>
      <Typography sx={{ fontSize: 12.5, fontWeight: 700, mb: hint ? "4px" : "10px" }}>
        {title}
      </Typography>
      {hint ? (
        <Typography sx={{ fontSize: 11.5, color: "text.disabled", mb: "10px" }}>{hint}</Typography>
      ) : null}
      {children}
    </Box>
  );
}

function PillOption({
  selected,
  onClick,
  children,
  sx,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  sx?: Record<string, unknown>;
}) {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "7px",
        borderRadius: "999px",
        p: "7px 14px",
        cursor: "pointer",
        bgcolor: selected ? "surface.primarySoftBg" : "surface.inset",
        border: "1px solid",
        borderColor: selected ? "surface.primarySoftBorder" : "divider",
        color: selected ? "surface.primarySoftFg" : "text.primary",
        "&:hover": { borderColor: "surface.primarySoftBorder" },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}

/** The design's borderless in-row inputs, and its one bordered text field. */
function InsetInput({
  value,
  placeholder,
  onChange,
  onEnter,
  bare,
  bold,
  sx,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  bare?: boolean;
  bold?: boolean;
  sx?: Record<string, unknown>;
}) {
  return (
    <InputBase
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") onEnter?.();
      }}
      sx={{
        fontSize: bare ? 13 : 12.5,
        fontWeight: bold ? 600 : 400,
        color: "text.primary",
        width: "100%",
        // MUI's default input padding makes an in-row field taller than the
        // 38px row the design draws; the bare variant reclaims it.
        "& .MuiInputBase-input": { p: bare ? "2px 0" : 0, height: "auto" },
        ...(bare
          ? { p: 0 }
          : {
              bgcolor: "surface.inset",
              border: "1px solid",
              borderColor: "surface.controlBorder",
              borderRadius: "11px",
              p: "10px 13px",
            }),
        ...sx,
      }}
    />
  );
}

function RailChip({
  label,
  index,
  current,
  onClick,
}: {
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
