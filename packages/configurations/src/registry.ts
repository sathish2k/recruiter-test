import { AuthModule } from "@recruit/module-auth";
import { CandidateModule } from "@recruit/module-candidate";
import { ClientModule } from "@recruit/module-client";
import { ContactModule } from "@recruit/module-contact";
import { CoreModule } from "@recruit/module-core";
import { JobModule } from "@recruit/module-jobs";
import { ProfileModule } from "@recruit/module-profile";
import { SettingsModule } from "@recruit/module-settings";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  AuthModule,
  CoreModule,
  ProfileModule,
  SettingsModule,
  ContactModule,
  ClientModule,
  JobModule,
  CandidateModule,
];
