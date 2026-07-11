"use client";

import { usePortalRouter } from "@recruit/sdk";
import { SignIn, type SignInValues } from "@recruit/shared";
import { signIn } from "next-auth/react";

export function AuthLoginComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  return (
    <SignIn
      id={id}
      onSubmit={async (values: SignInValues) => {
        const res = await signIn("credentials", {
          ...values,
          redirect: false,
        });
        if (res?.ok) router.push("Recruit.Root");
      }}
    />
  );
}
