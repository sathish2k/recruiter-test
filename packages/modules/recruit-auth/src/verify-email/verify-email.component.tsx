"use client";

import { useFetch } from "@recruit/sdk";
import { VerifyEmail } from "@recruit/shared";
import { useSearchParams } from "next/navigation";

export function AuthVerifyEmailComponent({ id }: { id: string }) {
  const { mutation } = useFetch(id);
  const email = useSearchParams().get("email") ?? "";

  return (
    <VerifyEmail
      id={id}
      handlers={{
        confirm: async (code) => {
          const result = (await mutation.create({ action: "confirm", email, code })) as {
            verified?: boolean;
          };
          return Boolean(result?.verified);
        },
        resend: async () => {
          await mutation.create({ action: "send", email });
        },
        confirmLink: async (token) => {
          const result = (await mutation.create({ action: "confirmLink", token })) as {
            verified?: boolean;
          };
          return Boolean(result?.verified);
        },
      }}
    />
  );
}
