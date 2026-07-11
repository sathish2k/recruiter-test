"use client";

import { useFetch } from "@recruit/sdk";
import { ForgotPassword, type ForgotPasswordValues } from "@recruit/shared";

export function AuthForgotPasswordComponent({ id }: { id: string }) {
  const { mutation } = useFetch(id);
  return (
    <ForgotPassword
      id={id}
      onSubmit={async (values: ForgotPasswordValues) => {
        await mutation.create(values);
      }}
    />
  );
}
