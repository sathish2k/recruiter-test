"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { type ReactNode, useEffect, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";
import { AuthActionRow, AuthNote, AuthTextAction } from "./auth-parts";

export interface ForgotPasswordValues {
  email: string;
}

interface ForgotPasswordConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
}

/** The API throttles a resend for a minute; the countdown says so rather than
 * leaving a button that silently does nothing. */
const RESEND_COOLDOWN = 60;

export function ForgotPassword({
  id,
  onSubmit,
}: {
  id: string;
  onSubmit: (values: ForgotPasswordValues) => void | Promise<void>;
}) {
  const { schema, links } = useConfiguration<ForgotPasswordConfig>(id);
  const { t } = useTranslation(id);
  const [sentEmail, setSentEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const back = links?.signIn ? { ...links.signIn, text: t(links.signIn.text ?? "") } : undefined;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((value) => (value > 0 ? value - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const sentSubtitle = (email: string): ReactNode => {
    const text = t("sent.subtitle", { email });
    const [before, after] = text.split(email);
    return (
      <>
        {before}
        <Box component="b" sx={{ fontWeight: 700, color: "text.primary" }}>
          {email}
        </Box>
        {after}
      </>
    );
  };

  const resend = async () => {
    if (!sentEmail || cooldown > 0) return;
    setError(null);
    try {
      await onSubmit({ email: sentEmail });
      setCooldown(RESEND_COOLDOWN);
    } catch {
      setError(t("errors.generic"));
    }
  };

  const slab = {
    kicker: t("slab.kicker"),
    title: t("slab.title"),
    blurb: t("slab.blurb"),
    footer: t("slab.footer"),
  };

  const footer = (
    <>
      {t("footerText")} {back ? <LinkRenderer config={back} /> : null}
    </>
  );

  if (sentEmail) {
    return (
      <AuthCard
        icon="mark-email-read"
        tone="success"
        slab={slab}
        footer={footer}
        title={t("sent.title")}
        subtitle={sentSubtitle(sentEmail)}
        subtitleGap="0px"
        data-testid="forgot-sent"
      >
        {error ? (
          <Alert severity="error" sx={{ mb: "16px" }}>
            {error}
          </Alert>
        ) : null}
        <AuthActionRow>
          {[
            <AuthTextAction
              key="resend"
              onClick={resend}
              disabled={cooldown > 0}
              label={cooldown > 0 ? t("sent.resendIn", { seconds: cooldown }) : t("sent.resend")}
            />,
            <AuthTextAction
              key="edit"
              onClick={() => {
                setSentEmail(null);
                setCooldown(0);
              }}
              label={t("sent.changeEmail")}
            />,
          ]}
        </AuthActionRow>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      slab={slab}
      footer={footer}
      title={t("title")}
      subtitle={t("subtitle")}
      data-testid="forgot-form"
    >
      {error ? (
        <Alert severity="error" sx={{ mb: "16px" }}>
          {error}
        </Alert>
      ) : null}
      {schema ? (
        <Box onInput={() => error && setError(null)}>
          <FormRenderer
            id={id}
            schema={schema}
            submitIcon="send"
            onSubmit={async (v: FormValues) => {
              const values = v as unknown as ForgotPasswordValues;
              setError(null);
              try {
                await onSubmit(values);
              } catch {
                // The endpoint always succeeds for a real request, so reaching
                // here means the request never landed.
                setError(t("errors.generic"));
                return;
              }
              setSentEmail(values.email);
              setCooldown(RESEND_COOLDOWN);
            }}
          />
        </Box>
      ) : null}
      <Box sx={{ mt: "24px" }}>
        <AuthNote icon="shield">
          <Typography sx={{ fontSize: 12, lineHeight: 1.65, color: "inherit" }}>
            {t("note")}
          </Typography>
        </AuthNote>
      </Box>
    </AuthCard>
  );
}
