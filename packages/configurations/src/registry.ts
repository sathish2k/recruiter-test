import { AiModule } from "@recruit/module-ai";
import { AuthModule } from "@recruit/module-auth";
import { CandidateModule } from "@recruit/module-candidate";
import { ClientModule } from "@recruit/module-client";
import { CoreModule } from "@recruit/module-core";
import { DashboardModule } from "@recruit/module-dashboard";
import { JobsModule } from "@recruit/module-jobs";
import { PipelineModule } from "@recruit/module-pipeline";
import { SettingsModule } from "@recruit/module-settings";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  AiModule,
  AuthModule,
  CandidateModule,
  ClientModule,
  CoreModule,
  DashboardModule,
  JobsModule,
  PipelineModule,
  SettingsModule,
];
