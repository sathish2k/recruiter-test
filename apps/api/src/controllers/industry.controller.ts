import { listIndustries } from "../services/industry.service";

/** The global industry catalogue for the client pickers. */
export async function getIndustries() {
  return listIndustries();
}
