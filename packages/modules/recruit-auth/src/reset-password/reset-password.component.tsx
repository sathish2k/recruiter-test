"use client";

import { useFetch } from "@recruit/sdk";
import { ResetPassword } from "@recruit/shared";

export function AuthResetPasswordComponent({ id }: { id: string }) {
  const { mutation } = useFetch(id);
  return (
    <ResetPassword
      id={id}
      onSubmit={async (values) => {
        await mutation.create(values);
      }}
    />
  );
}
