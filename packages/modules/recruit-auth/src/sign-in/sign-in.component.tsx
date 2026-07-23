"use client";

import { signIn, usePortalRouter, useTranslation } from "@recruit/sdk";
import { SignIn, type SignInValues } from "@recruit/shared";
import { useState } from "react";

export function AuthLoginComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const [error, setError] = useState<string | null>(null);

  return (
    <SignIn
      id={id}
      error={error ?? undefined}
      onClearError={() => setError(null)}
      onSubmit={async (values: SignInValues) => {
        setError(null);
        const res = await signIn.email({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        });
        // One generic message for any credential failure — don't reveal which
        // field was wrong.
        if (res.error) {
          setError(t("errors.invalid"));
          return;
        }
        router.push("Recruit.Root");
      }}
    />
  );
}
