"use client";

import { useFetch, usePortalRouter } from "@recruit/sdk";
import { SignUp, type SignUpValues } from "@recruit/shared";

export function AuthCreateAccountComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  const { mutation } = useFetch(id);
  return (
    <SignUp
      id={id}
      onSubmit={async (values: SignUpValues) => {
        await mutation.create(values);
        router.push("Auth.Login.Route");
      }}
    />
  );
}
