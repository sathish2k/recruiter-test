"use client";

import { StatCardRenderer } from "@recruit/shared";

export function ClientStatsComponent({ id }: { id: string }) {
  return <StatCardRenderer id={id} />;
}
