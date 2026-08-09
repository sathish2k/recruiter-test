"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useState } from "react";
import { FormRenderer } from "../forms";
import type { FormRendererProps, FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

export interface SignUpValues {
  firstName: string;
  lastName: string;
  agency: string;
  email: string;
  password: string;
}

interface SignUpConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
  /** Column model for the field grid — the design's paired name row. */
  gridContainer?: FormRendererProps["gridContainer"];
}

export function SignUp({
  id,
  onSubmit,
  error,
  onClearError,
}: {
  id: string;
  onSubmit: (values: SignUpValues) => void | Promise<void>;
  /** Shown as an error alert above the form, e.g. the address is taken. */
  error?: string;
  /** Called when the user edits a field while an error is shown — dismiss it. */
  onClearError?: () => void;
}) {
  const { schema, links, gridContainer } = useConfiguration<SignUpConfig>(id);
  const { t } = useTranslation(id);
  // Consent is a decision, not a value the account carries, so it stays out of
  // the schema and gates the submit here — the same shape as "remember me".
  const [accepted, setAccepted] = useState(false);
  const [showConsentError, setShowConsentError] = useState(false);
  const link = (config?: LinkRendererConfig) =>
    config ? { ...config, text: t(config.text ?? "") } : undefined;
  const tos = link(links?.tos);
  const privacy = link(links?.privacy);
  const signIn = link(links?.signIn);

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
          {t("footerText")} {signIn ? <LinkRenderer config={signIn} /> : null}
        </>
      }
    >
      {error ? (
        <Alert severity="error" sx={{ mb: "16px" }}>
          {error}
        </Alert>
      ) : null}
      {schema ? (
        <Box onInput={() => error && onClearError?.()}>
          <FormRenderer
            id={id}
            schema={schema}
            gridContainer={gridContainer}
            submitIcon="arrow-forward"
            onSubmit={(v: FormValues) => {
              if (!accepted) {
                setShowConsentError(true);
                return;
              }
              return onSubmit(v as unknown as SignUpValues);
            }}
            beforeSubmit={
              <Box sx={{ display: "flex", flexDirection: "column", gap: "8px", mt: "8px" }}>
                {/* Links can't legally nest inside a <button>, so the control is
                    the glyph alone (a real checkbox to AT) and the sentence —
                    with its links — sits beside it as its visible description. */}
                <Box sx={{ display: "flex", alignItems: "flex-start", gap: "11px" }}>
                  <Box
                    component="button"
                    type="button"
                    role="checkbox"
                    aria-checked={accepted}
                    aria-label={t(
                      "terms.consentAria",
                      "I agree to the Terms of Service and Privacy Policy, and I confirm I am authorised to create a workspace for this agency.",
                    )}
                    onClick={() => {
                      setAccepted((value) => !value);
                      setShowConsentError(false);
                    }}
                    sx={{
                      width: 18,
                      height: 18,
                      mt: "1px",
                      flex: "none",
                      p: 0,
                      borderRadius: "5px",
                      border: "1.5px solid",
                      borderColor: accepted
                        ? "primary.main"
                        : showConsentError
                          ? "surface.errorFg"
                          : "surface.controlOutline",
                      bgcolor: accepted ? "primary.main" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "primary.contrastText",
                      cursor: "pointer",
                      transition: "var(--recruit-motion-state)",
                    }}
                  >
                    {accepted ? <IconRenderer name="check" size={14} color="inherit" /> : null}
                  </Box>
                  <Typography
                    component="span"
                    sx={{ fontSize: 12.5, lineHeight: 1.6, color: "surface.textMuted" }}
                  >
                    {t("terms.consent")} {tos ? <LinkRenderer config={tos} /> : null}{" "}
                    {t("terms.and")} {privacy ? <LinkRenderer config={privacy} /> : null}
                    {t("terms.authorised")}
                  </Typography>
                </Box>
                {showConsentError ? (
                  <Typography
                    role="alert"
                    sx={{
                      display: "flex",
                      gap: "5px",
                      fontSize: 11.5,
                      lineHeight: 1.5,
                      color: "surface.errorFg",
                    }}
                  >
                    <IconRenderer name="error" size={14} color="inherit" />
                    {t("terms.required")}
                  </Typography>
                ) : null}
              </Box>
            }
          />
        </Box>
      ) : null}

      <Typography sx={{ mt: "14px", fontSize: 11.5, lineHeight: 1.6, color: "text.secondary" }}>
        {t("terms.text")} {tos ? <LinkRenderer config={tos} /> : null} {t("terms.and")}{" "}
        {privacy ? <LinkRenderer config={privacy} /> : null}.
      </Typography>
    </AuthCard>
  );
}
