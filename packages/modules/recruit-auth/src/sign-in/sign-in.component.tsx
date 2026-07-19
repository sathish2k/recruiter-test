"use client";

import { signIn, usePortalRouter } from "@recruit/sdk";
import { SignIn, type SignInValues } from "@recruit/shared";

export function AuthLoginComponent({ id }: { id: string }) {
  const router = usePortalRouter();
  return (
    <SignIn
      id={id}
      onSubmit={async (values: SignInValues) => {
        const res = await signIn.email({
          email: values.email,
          password: values.password,
        });
        if (!res.error) router.push("Recruit.Root");
      }}
    />
  );
}
