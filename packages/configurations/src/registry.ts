import { AuthModule } from "@recruit/module-auth";
import { ClientModule } from "@recruit/module-client";
import { CoreModule } from "@recruit/module-core";
import { DashboardModule } from "@recruit/module-dashboard";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [
  AuthModule,
  ClientModule,
  CoreModule,
  DashboardModule,
];
