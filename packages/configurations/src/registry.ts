import { AuthModule } from "@recruit/module-auth";
import { CandidateModule } from "@recruit/module-candidate";
import { ClientModule } from "@recruit/module-client";
import { ContactModule } from "@recruit/module-contact";
import { CoreModule } from "@recruit/module-core";
import { DashboardModule } from "@recruit/module-dashboard";
import { JobModule } from "@recruit/module-jobs";
import { OnboardingModule } from "@recruit/module-onboarding";
import { PipelineModule } from "@recruit/module-pipeline";
import { ProfileModule } from "@recruit/module-profile";
import { SettingsModule } from "@recruit/module-settings";
import { RoleDashboardModules } from "@recruit/roles";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  AuthModule,
  CoreModule,
  DashboardModule,
  ...RoleDashboardModules,
  OnboardingModule,
  ProfileModule,
  SettingsModule,
  ContactModule,
  ClientModule,
  JobModule,
  CandidateModule,
  PipelineModule,
];
