import type { Module } from "@recruit/sdk";
import { CLIENTS_COMPONENT } from "./clients/bootstrap";

export const ClientModule: Module = {
  id: "Client.Module",
  components: [CLIENTS_COMPONENT],
};
