import { AllModules, allConfigurations, routes } from "@recruit/configurations";
import { createPortalApp } from "@recruit/sdk";
import { guards } from "../../guards";

const PortalApp = createPortalApp({
  routes,
  configurations: allConfigurations,
  modules: AllModules,
  guards,
});

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  return <PortalApp slugParts={slug ?? []} />;
}
