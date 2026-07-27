/**
 * `useFetch` treats ANY non-undefined `data` as "a value was provided, don't
 * fetch". The engine injects `data={}` into every component it renders, so a
 * renderer bound straight to a bootstrap `value` receives that empty
 * placeholder and — unless it is normalised back to `undefined` — never calls
 * its datasource and silently renders empty.
 *
 * Pass the injected prop through the matching helper before handing it to
 * `useFetch`.
 */

/** For renderers whose data is a row array (graphs, tables). An actual array is
 * a real seed, even when empty ("no rows"); anything else means "go fetch". */
export function seedRows<T>(data: unknown): T[] | undefined {
  return Array.isArray(data) ? (data as T[]) : undefined;
}

/** For renderers whose data is a single row (stat cards, alerts, funnels). An
 * object with no keys is the engine's placeholder, so it means "go fetch". */
export function seedRecord<T extends object>(data: T | undefined): T | undefined {
  return data && Object.keys(data).length > 0 ? data : undefined;
}
