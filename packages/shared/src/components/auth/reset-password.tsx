"use client";

import LockResetRounded from "@mui/icons-material/LockResetRounded";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { FormRenderer } from "../form-renderer";
import type { FormValues, JsonSchema } from "../form-renderer/types";
import { AuthCard } from "./auth-card";

export interface ResetPasswordValues {
  password: string;
}

interface ResetPasswordConfig {
  schema?: JsonSchema;
}

interface ResetPasswordProps {
  id: string;
  onSubmit: (
    values: ResetPasswordValues & { token: string },
  ) => void | Promise<void>;
}

// useSearchParams must sit inside a Suspense boundary (Next requirement).
export function ResetPassword(props: ResetPasswordProps) {
  return (
    <Suspense>
      <ResetPasswordForm {...props} />
    </Suspense>
  );
}

function ResetPasswordForm({ id, onSubmit }: ResetPasswordProps) {
  const { schema } = useConfiguration<ResetPasswordConfig>(id);
  const { t } = useTranslation(id);
  const token = useSearchParams().get("token");

  return (
    <AuthCard
      icon={<LockResetRounded sx={{ fontSize: 26 }} />}
      title={t("title")}
      subtitle={t("subtitle")}
    >
      {!token ? (
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
          onSubmit={(v: FormValues) =>
            onSubmit({ ...(v as unknown as ResetPasswordValues), token })
          }
        />
      ) : null}
    </AuthCard>
  );
}
