"use client";

import { type ActionHandler, TableFilterExportRenderer } from "@recruit/shared";

export function JobsComponent({ id }: { id: string }) {
  const actionHandler: ActionHandler = {
    edit: (row) => console.info("edit job", row.id),
    delete: (row) => console.info("delete job", row.id),
  };
  return <TableFilterExportRenderer id={id} actionHandler={actionHandler} />;
}
