"use client";

import LoginRounded from "@mui/icons-material/LoginRounded";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { FormRenderer } from "../form-renderer";
import type { FormValues, JsonSchema } from "../form-renderer/types";
import {
  LinkRenderer,
  type LinkRendererConfig,
} from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

export interface SignInValues {
  email: string;
  password: string;
}

interface SignInConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
}

export function SignIn({
  id,
  onSubmit,
}: {
  id: string;
  onSubmit: (values: SignInValues) => void | Promise<void>;
}) {
  const { schema, links } = useConfiguration<SignInConfig>(id);
  const { t } = useTranslation(id);
  const link = (config?: LinkRendererConfig) =>
    config ? { ...config, text: t(config.text ?? "") } : undefined;
  const forgot = link(links?.forgot);
  const signUp = link(links?.signUp);

  return (
    <AuthCard
      icon={<LoginRounded sx={{ fontSize: 26 }} />}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      {schema ? (
        <FormRenderer
          id={id}
          schema={schema}
          onSubmit={(v: FormValues) => onSubmit(v as unknown as SignInValues)}
          beforeSubmit={
            forgot ? (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <LinkRenderer config={forgot} />
              </Box>
            ) : undefined
          }
        />
      ) : null}
      <Typography
        sx={{ mt: "22px", fontSize: 13, color: "#9A968E", textAlign: "center" }}
      >
        {t("footerText")} {signUp ? <LinkRenderer config={signUp} /> : null}
      </Typography>
    </AuthCard>
  );
}
