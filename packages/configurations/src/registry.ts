import { AuthModule } from "@recruit/module-auth";
import { CoreModule } from "@recruit/module-core";
import type { Module } from "@recruit/sdk";

// Auth-scoped registry. Add domain modules (dashboard, jobs, …) here as they
// are ported over.
export const AllModules: Module[] = [AuthModule, CoreModule];
