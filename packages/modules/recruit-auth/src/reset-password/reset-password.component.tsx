"use client";

import { useFetch, usePortalRouter } from "@recruit/sdk";
import { ResetPassword } from "@recruit/shared";

export function AuthResetPasswordComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  const { mutation } = useFetch(id);
  return (
    <ResetPassword
      id={id}
      onSubmit={async (values) => {
        await mutation.create(values);
        router.push("Auth.Login.Route");
      }}
    />
  );
}
