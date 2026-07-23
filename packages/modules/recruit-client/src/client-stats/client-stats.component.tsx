"use client";

import { StatCardRenderer } from "@recruit/shared";

export function ClientStatsComponent({ id }: { id: string }) {
  return <StatCardRenderer id={id} gridTemplateColumns="repeat(auto-fit,minmax(190px,1fr))" />;
}
