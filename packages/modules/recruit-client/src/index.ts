import type { Module } from "@recruit/sdk";
import { CLIENT_DETAIL_COMPONENT } from "./client-detail/bootstrap";
import { CLIENTS_COMPONENT } from "./clients/bootstrap";

export const ClientModule: Module = {
  id: "Client.Module",
  components: [CLIENTS_COMPONENT, CLIENT_DETAIL_COMPONENT],
};
