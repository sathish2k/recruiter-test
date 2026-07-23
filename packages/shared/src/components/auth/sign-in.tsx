"use client";

import FlightTakeoffRounded from "@mui/icons-material/FlightTakeoffRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

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
}: {
  id: string;
  onSubmit: (values: SignInValues) => void | Promise<void>;
  /** Shown as an error alert above the form, e.g. bad credentials. */
  error?: string;
  /** Called when the user edits a field while an error is shown — dismiss it. */
  onClearError?: () => void;
}) {
  const { schema, links } = useConfiguration<SignInConfig>(id);
  const { t } = useTranslation(id);
  const [remember, setRemember] = useState(true);
  const link = (config?: LinkRendererConfig) =>
    config ? { ...config, text: t(config.text ?? "") } : undefined;
  const forgot = link(links?.forgot);
  const signUp = link(links?.signUp);

  return (
    <AuthCard
      icon={<FlightTakeoffRounded sx={{ fontSize: 26 }} />}
      title={t("title")}
      subtitle={t("subtitle")}
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
            beforeSubmit={
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box
                  onClick={() => setRemember((r) => !r)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: "5px",
                      border: remember
                        ? "1px solid var(--mui-palette-primary-main)"
                        : "1px solid var(--mui-palette-surface-controlOutline)",
                      background: remember
                        ? "linear-gradient(135deg,var(--mui-palette-primary-light),var(--mui-palette-primary-dark))"
                        : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      transition: "background .15s",
                    }}
                  >
                    {remember ? <IconRenderer name="check" size={12} /> : null}
                  </Box>
                  <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
                    {t("rememberMe")}
                  </Typography>
                </Box>
                {forgot ? <LinkRenderer config={forgot} /> : null}
              </Box>
            }
          />
        </Box>
      ) : null}
      <Typography sx={{ mt: "22px", fontSize: 13, color: "text.secondary", textAlign: "center" }}>
        {t("footerText")} {signUp ? <LinkRenderer config={signUp} /> : null}
      </Typography>
    </AuthCard>
  );
}
