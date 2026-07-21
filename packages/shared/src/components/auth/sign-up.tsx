"use client";

import PersonAddAlt1Rounded from "@mui/icons-material/PersonAddAlt1Rounded";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

export interface SignUpValues {
  fullName: string;
  agency: string;
  email: string;
  password: string;
}

interface SignUpConfig {
  schema?: JsonSchema;
  links?: Record<string, LinkRendererConfig>;
}

export function SignUp({
  id,
  onSubmit,
}: {
  id: string;
  onSubmit: (values: SignUpValues) => void | Promise<void>;
}) {
  const { schema, links } = useConfiguration<SignUpConfig>(id);
  const { t } = useTranslation(id);
  const link = (config?: LinkRendererConfig) =>
    config ? { ...config, text: t(config.text ?? "") } : undefined;
  const tos = link(links?.tos);
  const privacy = link(links?.privacy);
  const signIn = link(links?.signIn);

  return (
    <AuthCard
      icon={<PersonAddAlt1Rounded sx={{ fontSize: 26 }} />}
      title={t("title")}
      subtitle={t("subtitle")}
      width={440}
    >
      {schema ? (
        <FormRenderer
          id={id}
          schema={schema}
          onSubmit={(v: FormValues) => onSubmit(v as unknown as SignUpValues)}
        />
      ) : null}

      <Typography
        sx={{
          mt: "16px",
          fontSize: 11.5,
          lineHeight: 1.5,
          color: "text.disabled",
          textAlign: "center",
        }}
      >
        {t("terms.text")} {tos ? <LinkRenderer config={tos} /> : null} {t("terms.and")}{" "}
        {privacy ? <LinkRenderer config={privacy} /> : null}.
      </Typography>

      <Typography sx={{ mt: "20px", fontSize: 13, color: "text.secondary", textAlign: "center" }}>
        {t("footerText")} {signIn ? <LinkRenderer config={signIn} /> : null}
      </Typography>
    </AuthCard>
  );
}
