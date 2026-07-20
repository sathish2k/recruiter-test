"use client";

import LockResetRounded from "@mui/icons-material/LockResetRounded";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { type ReactNode, useState } from "react";
import { FormRenderer } from "../form-renderer";
import type { FormValues, JsonSchema } from "../form-renderer/types";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

export interface ForgotPasswordValues {
  email: string;
}

interface ForgotPasswordConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
}

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
  const back = links?.signIn ? { ...links.signIn, text: t(links.signIn.text ?? "") } : undefined;

  const sentSubtitle = (email: string): ReactNode => {
    const text = t("sent.subtitle", { email });
    const [before, after] = text.split(email);
    return (
      <>
        {before}
        <Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
          {email}
        </Box>
        {after}
      </>
    );
  };

  return (
    <AuthCard
      icon={<LockResetRounded sx={{ fontSize: 26 }} />}
      title={sentEmail ? t("sent.title") : t("title")}
      subtitle={sentEmail ? sentSubtitle(sentEmail) : t("subtitle")}
    >
      {sentEmail ? (
        <Box sx={{ textAlign: "center" }}>
          <Link
            component="button"
            type="button"
            underline="none"
            onClick={() => onSubmit({ email: sentEmail })}
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: "#F0B27C",
              "&:hover": { color: "#FF8A3C" },
            }}
          >
            {t("sent.resend")}
          </Link>
        </Box>
      ) : schema ? (
        <FormRenderer
          id={id}
          schema={schema}
          onSubmit={async (v: FormValues) => {
            const values = v as unknown as ForgotPasswordValues;
            await onSubmit(values);
            setSentEmail(values.email);
          }}
        />
      ) : null}
      <Typography sx={{ mt: "20px", fontSize: 13, color: "#9A968E", textAlign: "center" }}>
        {t("footerText")} {back ? <LinkRenderer config={back} /> : null}
      </Typography>
    </AuthCard>
  );
}
