"use client";

import { useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import { SignUp, type SignUpValues } from "@recruit/shared";
import { useState } from "react";

export function AuthCreateAccountComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const { mutation } = useFetch(id);
  const [error, setError] = useState<string | null>(null);

  return (
    <SignUp
      id={id}
      error={error ?? undefined}
      onClearError={() => setError(null)}
      onSubmit={async (values: SignUpValues) => {
        setError(null);
        // The design collects the name in two fields; the account carries one.
        const { firstName, lastName, ...rest } = values;
        try {
          await mutation.create({ ...rest, fullName: `${firstName} ${lastName}`.trim() });
        } catch (cause) {
          // 409 is the one failure the user can act on — the address is taken.
          const httpStatus = (cause as { response?: { status?: number } }).response?.status;
          setError(t(httpStatus === 409 ? "errors.emailTaken" : "errors.generic"));
          return;
        }
        // §5.1.2 — verification, not the login screen, is what follows sign-up.
        router.pushPath(
          `${router.getPathFromRouteId("Auth.VerifyEmail.Route")}?email=${encodeURIComponent(values.email)}`,
        );
      }}
    />
  );
}
