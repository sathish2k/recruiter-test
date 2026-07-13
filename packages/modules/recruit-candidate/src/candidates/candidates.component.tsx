"use client";

import { TableFilterExportRenderer } from "@recruit/shared";

export function CandidatesComponent({ id }: { id: string }) {
  return <TableFilterExportRenderer id={id} />;
}
