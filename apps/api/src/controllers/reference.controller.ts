import { listCurrencies, listDialCodes, listLanguages, listTimezones } from "../lib/reference-data";

/** Static reference lists. No org scoping — the data is the same for everyone,
 * which is why these are cached in-process and safe to cache in the browser. */
export function getReference() {
  return {
    data: {
      timezones: listTimezones(),
      dialCodes: listDialCodes(),
      currencies: listCurrencies(),
      languages: listLanguages(),
    },
  };
}
