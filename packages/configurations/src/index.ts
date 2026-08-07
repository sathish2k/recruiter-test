import type { Configuration } from "@recruit/sdk";
import { layouts } from "./layouts";
import { AuthPages } from "./pages";

export { type Resource, ROLE_PERMISSIONS } from "./access";
export { AllModules } from "./registry";
export { routes } from "./routes";

export const allConfigurations: Configuration[] = [...layouts, ...Object.values(AuthPages)];
