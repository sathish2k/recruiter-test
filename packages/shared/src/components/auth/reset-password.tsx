"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";
import { AuthNote, AuthSummary } from "./auth-parts";

export interface ResetPasswordValues {
  password: string;
}

interface ResetPasswordConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
}

interface ResetPasswordProps {
  id: string;
  onSubmit: (values: ResetPasswordValues & { token: string }) => void | Promise<void>;
}

export function ResetPassword(props: ResetPasswordProps) {
  return (
    <Suspense>
      <ResetPasswordForm {...props} />
    </Suspense>
  );
}

function ResetPasswordForm({ id, onSubmit }: ResetPasswordProps) {
  const { schema, links } = useConfiguration<ResetPasswordConfig>(id);
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const token = useSearchParams().get("token");
  const [done, setDone] = useState(false);
  // A token can be missing, or present but already spent/expired — the API only
  // tells us which at submit time. Both land on the same invalid-link state.
  const [tokenRejected, setTokenRejected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const back = links?.signIn ? { ...links.signIn, text: t(links.signIn.text ?? "") } : undefined;

  const slab = {
    kicker: t("slab.kicker"),
    title: t("slab.title"),
    blurb: t("slab.blurb"),
    footer: t("slab.footer"),
  };
  const footer = back ? <LinkRenderer config={back} /> : null;

  // Saving ends every other session, so the design reports exactly what
  // happened rather than a bare "done".
  if (done) {
    return (
      <AuthCard
        icon="check-circle"
        tone="success"
        slab={slab}
        footer={footer}
        title={t("success.title")}
        subtitle={t("success.subtitle")}
        subtitleGap="0px"
        data-testid="reset-done"
      >
        <AuthSummary
          rows={[
            { label: t("success.rows.sessions"), value: t("success.rows.sessionsValue") },
            { label: t("success.rows.logged"), value: t("success.rows.loggedValue") },
          ]}
        />
        <Button
          variant="contained"
          size="large"
          fullWidth
          onClick={() => links?.signIn?.routeId && router.push(links.signIn.routeId)}
          endIcon={<IconRenderer name="arrow-forward" size={18} />}
          sx={{ mt: "24px" }}
        >
          {t("success.cta")}
        </Button>
      </AuthCard>
    );
  }

  // No token means the link was truncated in the mail client; a rejected one
  // means it expired or a newer link superseded it. Either way the account is
  // untouched — say so.
  if (!token || tokenRejected) {
    return (
      <AuthCard
        icon="link-off"
        tone="error"
        slab={slab}
        footer={footer}
        title={t("invalidState.title")}
        subtitle={t("invalidState.subtitle")}
        subtitleGap="20px"
        data-testid="reset-invalid"
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            p: "13px 15px",
            borderRadius: "10px",
            bgcolor: "surface.inset",
          }}
        >
          {[t("invalidState.reassure1"), t("invalidState.reassure2")].map((line) => (
            <Box
              key={line}
              sx={{
                display: "flex",
                gap: "9px",
                fontSize: 12.5,
                lineHeight: 1.55,
                color: "surface.textMuted",
              }}
            >
              <Box sx={{ flex: "none", lineHeight: 1.3, color: "surface.primarySoftFg" }}>
                <IconRenderer name="check" size={16} color="inherit" />
              </Box>
              {line}
            </Box>
          ))}
        </Box>
        {links?.forgot ? (
          <LinkRenderer config={links.forgot}>
            <Button variant="contained" size="large" fullWidth sx={{ mt: "22px" }}>
              {t("invalidState.cta")}
            </Button>
          </LinkRenderer>
        ) : null}
      </AuthCard>
    );
  }

  return (
    <AuthCard
      slab={slab}
      footer={footer}
      title={t("title")}
      subtitle={t("subtitle")}
      data-testid="reset-form"
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
            onSubmit={async (v: FormValues) => {
              const { password } = v as unknown as ResetPasswordValues;
              setError(null);
              try {
                await onSubmit({ password, token });
              } catch (cause) {
                // The API answers 400 for a token it won't accept; that is the
                // invalid-link state, not a form error.
                if ((cause as { response?: { status?: number } }).response?.status === 400) {
                  setTokenRejected(true);
                  return;
                }
                setError(t("errors.generic"));
                return;
              }
              setDone(true);
            }}
          />
        </Box>
      ) : null}
      <Box sx={{ mt: "24px" }}>
        <AuthNote icon="devices">{t("note")}</AuthNote>
      </Box>
    </AuthCard>
  );
}
