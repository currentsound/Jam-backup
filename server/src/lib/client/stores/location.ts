import {derived, readable, type Readable, readonly, writable} from "svelte/store";
import {parsePath, parseUrlConfig} from "$lib/client/utils/url-utils";
import {type DynamicConfig, dynamicConfigSchema} from "$lib/types";
import {pof} from "$lib/utils";

const writableLocationStore = writable<Location>(location, (set) => {
  const updater = () => set(location);
  window.addEventListener('popstate', updater);
  window.addEventListener('hashchange', updater);
  return () => {
    window.removeEventListener('popstate', updater);
    window.removeEventListener('hashchange', updater);
  };
});

export const locationStore = readonly(writableLocationStore);

export const route = derived(locationStore, $locationStore => {
  let {route} = parsePath($locationStore.pathname);
  return route;
});

export const dynamicConfig = derived<Readable<Location>, DynamicConfig>(locationStore, $locationStore => {
  let { room} = parsePath($locationStore.pathname);
  let config = parseUrlConfig($locationStore.search, $locationStore.hash);
  config.room = {...room, ...(config.room ?? null)};
  return pof(dynamicConfigSchema, config, {room});
});


export function navigate(route: string) {
  history.pushState(null, '', route);
  writableLocationStore.set(location);
}
