import { AuthModule } from "@recruit/module-auth";
import { CandidateModule } from "@recruit/module-candidate";
import { ClientModule } from "@recruit/module-client";
import { CoreModule } from "@recruit/module-core";
import { DashboardModule } from "@recruit/module-dashboard";
import { JobsModule } from "@recruit/module-jobs";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  AuthModule,
  CandidateModule,
  ClientModule,
  CoreModule,
  DashboardModule,
  JobsModule,
];
