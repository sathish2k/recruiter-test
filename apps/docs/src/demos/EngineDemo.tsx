import {
  type Configuration,
  createPortalApp,
  type Module,
  type Route,
} from "@recruit/sdk";
import { EngineSwitcher } from "../components/Demo";
import { DEMO_MODULES } from "./registry";

function parseUrl(url: string): string[] {
  const clean = url.trim().replace(/^\/+/, "").replace(/\/+$/, "");
  return clean === "" ? [] : clean.split("/");
}

export async function EngineDemo({
  routes,
  configurations,
  code,
  url = "/",
  urls,
  frame = false,
  height = 340,
  modules = DEMO_MODULES,
}: {
  routes: Route[];
  configurations: Configuration[];
  code: string;
  url?: string;
  urls?: string[];
  frame?: boolean;
  height?: number;
  modules?: Module[];
}) {
  const PortalApp = createPortalApp({ routes, configurations, modules });
  const list = urls ?? [url];
  const items = await Promise.all(
    list.map(async (u) => ({
      url: u,
      node: await PortalApp({ slugParts: parseUrl(u) }),
    })),
  );

  return (
    <EngineSwitcher items={items} code={code} frame={frame} height={height} />
  );
}
