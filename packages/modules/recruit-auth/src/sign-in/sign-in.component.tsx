"use client";

import { signIn, usePortalRouter, useTranslation } from "@recruit/sdk";
import { SignIn, type SignInValues } from "@recruit/shared";
import { useState } from "react";

/** The API's shape when it turns a locked account away. */
interface SignInFailure {
  code?: string;
  status?: number;
  retryAfter?: number;
}

/** Fallback window when the API refuses without saying how long — matches the
 * server's own 15 minutes. */
const FALLBACK_LOCK_SECONDS = 15 * 60;

export function AuthLoginComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const [error, setError] = useState<string | null>(null);
  const [lockedFor, setLockedFor] = useState(0);

  return (
    <SignIn
      id={id}
      error={error ?? undefined}
      onClearError={() => setError(null)}
      lockedFor={lockedFor}
      onLockExpired={() => setLockedFor(0)}
      onSubmit={async (values: SignInValues) => {
        setError(null);
        const res = await signIn.email({
          email: values.email,
          password: values.password,
          rememberMe: values.rememberMe,
        });
        const failure = res.error as SignInFailure | undefined;
        if (failure) {
          // A locked account replaces the form outright — there is nothing worth
          // submitting until the countdown runs out.
          if (failure.code === "ACCOUNT_LOCKED" || failure.status === 403) {
            setLockedFor(
              failure.retryAfter && failure.retryAfter > 0
                ? failure.retryAfter
                : FALLBACK_LOCK_SECONDS,
            );
            return;
          }
          // One generic message for any credential failure — don't reveal which
          // field was wrong.
          setError(t("errors.invalid"));
          return;
        }
        router.push("Recruit.Root");
      }}
    />
  );
}
