"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useEffect, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";
import { AuthNote } from "./auth-parts";

export interface SignInValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface SignInConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
}

export function SignIn({
  id,
  onSubmit,
  error,
  onClearError,
  lockedFor,
  onLockExpired,
}: {
  id: string;
  onSubmit: (values: SignInValues) => void | Promise<void>;
  /** Shown as an error alert above the form, e.g. bad credentials. */
  error?: string;
  /** Called when the user edits a field while an error is shown — dismiss it. */
  onClearError?: () => void;
  /** Seconds the account stays locked. Switches the screen to the locked state. */
  lockedFor?: number;
  /** Called when the countdown reaches zero so the form can come back. */
  onLockExpired?: () => void;
}) {
  const { schema, links } = useConfiguration<SignInConfig>(id);
  const { t } = useTranslation(id);
  const [remember, setRemember] = useState(true);
  const link = (config?: LinkRendererConfig) =>
    config ? { ...config, text: t(config.text ?? "") } : undefined;
  const forgot = link(links?.forgot);
  const signUp = link(links?.signUp);

  if (lockedFor && lockedFor > 0) {
    return (
      <AccountLocked
        id={id}
        seconds={lockedFor}
        onExpired={onLockExpired}
        forgot={forgot}
        signUp={signUp}
      />
    );
  }

  return (
    <AuthCard
      title={t("title")}
      subtitle={t("subtitle")}
      slab={{
        kicker: t("slab.kicker"),
        title: t("slab.title"),
        blurb: t("slab.blurb"),
        footer: t("slab.footer"),
      }}
      footer={
        <>
          {t("footerText")} {signUp ? <LinkRenderer config={signUp} /> : null}
        </>
      }
    >
      {error ? (
        <Alert severity="error" sx={{ mb: "16px" }}>
          {error}
        </Alert>
      ) : null}
      {schema ? (
        <Box
          onInput={() => {
            if (error) onClearError?.();
          }}
        >
          <FormRenderer
            id={id}
            schema={schema}
            onSubmit={(v: FormValues) =>
              onSubmit({ ...(v as unknown as SignInValues), rememberMe: remember })
            }
            submitIcon="arrow-forward"
            beforeSubmit={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                  m: "18px 0 4px",
                }}
              >
                <Box
                  component="button"
                  type="button"
                  onClick={() => setRemember((r) => !r)}
                  aria-pressed={remember}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    border: "none",
                    background: "none",
                    p: 0,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      flex: "none",
                      borderRadius: "4px",
                      border: "1.5px solid",
                      borderColor: remember ? "primary.main" : "surface.controlOutline",
                      bgcolor: remember ? "primary.main" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.contrastText",
                      transition: "var(--recruit-motion-state)",
                    }}
                  >
                    {remember ? <IconRenderer name="check" size={14} color="inherit" /> : null}
                  </Box>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {t("rememberMe")}
                  </Typography>
                </Box>
                {forgot ? <LinkRenderer config={forgot} /> : null}
              </Box>
            }
          />
        </Box>
      ) : null}
    </AuthCard>
  );
}

/**
 * The account has just refused too many passwords. Shown in place of the form so
 * there is nothing to submit — the countdown is the whole interaction, and it
 * hands the form back when it reaches zero.
 */
function AccountLocked({
  id,
  seconds,
  onExpired,
  forgot,
  signUp,
}: {
  id: string;
  seconds: number;
  onExpired?: () => void;
  forgot?: LinkRendererConfig;
  signUp?: LinkRendererConfig;
}) {
  const { t } = useTranslation(id);
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => setRemaining(seconds), [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpired?.();
      return;
    }
    const timer = setTimeout(() => setRemaining((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining, onExpired]);

  const clock = `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`;

  return (
    <AuthCard
      icon="lock"
      tone="error"
      title={t("locked.title")}
      subtitle={t("locked.subtitle")}
      subtitleGap="20px"
      slab={{
        kicker: t("slab.kicker"),
        title: t("slab.title"),
        blurb: t("slab.blurb"),
        footer: t("slab.footer"),
      }}
      footer={
        <>
          {t("footerText")} {signUp ? <LinkRenderer config={signUp} /> : null}
        </>
      }
      data-testid="signin-locked"
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          p: "18px",
          borderRadius: "12px",
          bgcolor: "surface.inset",
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 600, color: "surface.textMuted" }}>
          {t("locked.countdownLabel")}
        </Typography>
        <Typography
          data-testid="signin-locked-countdown"
          sx={{ fontSize: 30, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}
        >
          {clock}
        </Typography>
      </Box>
      <Box sx={{ mt: "20px" }}>
        <AuthNote icon="shield">{t("locked.note")}</AuthNote>
      </Box>
      {forgot ? (
        <Box sx={{ mt: "18px", textAlign: "center" }}>
          <LinkRenderer config={{ ...forgot, text: t("locked.resetInstead") }} />
        </Box>
      ) : null}
    </AuthCard>
  );
}
