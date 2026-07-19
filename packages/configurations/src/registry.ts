import { AiModule } from "@recruit/module-ai";
import { AuthModule } from "@recruit/module-auth";
import { CandidateModule } from "@recruit/module-candidate";
import { ClientModule } from "@recruit/module-client";
import { CoreModule } from "@recruit/module-core";
import { DashboardModule } from "@recruit/module-dashboard";
import { JobsModule } from "@recruit/module-jobs";
import { OpsModule } from "@recruit/module-ops";
import { PipelineModule } from "@recruit/module-pipeline";
import { PortalModule } from "@recruit/module-portal";
import { SettingsModule } from "@recruit/module-settings";
import { SupportModule } from "@recruit/module-support";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  AiModule,
  AuthModule,
  CandidateModule,
  ClientModule,
  CoreModule,
  DashboardModule,
  JobsModule,
  OpsModule,
  PipelineModule,
  PortalModule,
  SettingsModule,
  SupportModule,
];
