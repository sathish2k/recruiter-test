"use client";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { useConfiguration, usePortalRouter, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { FormRenderer } from "../forms";
import type { FormValues, JsonSchema } from "../forms/types";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { AuthCard } from "./auth-card";

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
  const back = links?.signIn ? { ...links.signIn, text: t(links.signIn.text ?? "") } : undefined;

  return (
    <AuthCard
      icon={<IconRenderer name="key" size={26} />}
      title={done ? t("success.title") : t("title")}
      subtitle={done ? t("success.subtitle") : t("subtitle")}
    >
      {done ? (
        <Button
          variant="contained"
          fullWidth
          onClick={() => links?.signIn?.routeId && router.push(links.signIn.routeId)}
          sx={{
            borderRadius: "12px",
            py: "14px",
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {t("success.cta")}
        </Button>
      ) : !token ? (
        <Typography
          sx={{
            fontSize: 14,
            color: "text.secondary",
            textAlign: "center",
            py: 2,
          }}
        >
          {t("invalid")}
        </Typography>
      ) : schema ? (
        <FormRenderer
          id={id}
          schema={schema}
          onSubmit={async (v: FormValues) => {
            const { password } = v as unknown as ResetPasswordValues;
            await onSubmit({ password, token });
            setDone(true);
          }}
        />
      ) : null}
      {!done ? (
        <Typography
          sx={{
            mt: "20px",
            fontSize: 13,
            color: "text.secondary",
            textAlign: "center",
          }}
        >
          {back ? <LinkRenderer config={back} /> : null}
        </Typography>
      ) : null}
    </AuthCard>
  );
}
