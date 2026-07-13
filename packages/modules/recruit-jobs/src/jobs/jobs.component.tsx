"use client";

import { TableFilterExportRenderer } from "@recruit/shared";

export function JobsComponent({ id }: { id: string }) {
  return <TableFilterExportRenderer id={id} />;
}
