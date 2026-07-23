import { AuthModule } from "@recruit/module-auth";
import { ClientModule } from "@recruit/module-client";
import { ContactModule } from "@recruit/module-contact";
import { CoreModule } from "@recruit/module-core";
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
];
