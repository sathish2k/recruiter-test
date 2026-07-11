import { AuthModule } from "@recruit/module-auth";
import { DashboardModule } from "@recruit/module-dashboard";
import type { Module } from "@recruit/sdk";

export const AllModules: Module[] = [AuthModule, DashboardModule];
