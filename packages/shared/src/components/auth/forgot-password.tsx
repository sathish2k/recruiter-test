"use client";

import LockResetRounded from "@mui/icons-material/LockResetRounded";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useState } from "react";
import { FormRenderer } from "../form-renderer";
import type { FormValues, JsonSchema } from "../form-renderer/types";
import {
  LinkRenderer,
  type LinkRendererConfig,
} from "../renderers/link-renderer";
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
  const [sent, setSent] = useState(false);
  const back = links?.signIn
    ? { ...links.signIn, text: t(links.signIn.text ?? "") }
    : undefined;

  return (
    <AuthCard
      icon={<LockResetRounded sx={{ fontSize: 26 }} />}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      {sent ? (
        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            textAlign: "center",
            py: 2,
          }}
        >
          {t("sent")}
        </Typography>
      ) : schema ? (
        <FormRenderer
          id={id}
          schema={schema}
          onSubmit={async (v: FormValues) => {
            await onSubmit(v as unknown as ForgotPasswordValues);
            setSent(true);
          }}
        />
      ) : null}
      <Typography
        sx={{ mt: "20px", fontSize: 13, color: "#9A968E", textAlign: "center" }}
      >
        {back ? <LinkRenderer config={back} /> : null}
      </Typography>
    </AuthCard>
  );
}
