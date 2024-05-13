import {derived, readable, type Readable, readonly, writable} from "svelte/store";
import {parseUrlConfig} from "$lib/client/utils/url-utils";
import {type DynamicConfig, dynamicConfigSchema} from "$lib/types";
import {pof} from "$lib/utils";

const writableLocationStore = writable<Location>();

export const initializeLocationStore = () => {
  const updater = () => writableLocationStore.set(location);
  window.addEventListener('popstate', updater);
  window.addEventListener('hashchange', updater);

}

export const locationStore = readonly(writableLocationStore);

export const dynamicConfig = derived<Readable<Location>, DynamicConfig>(locationStore, $locationStore => {
  if(!$locationStore) {
    return {} as DynamicConfig;
  }
  const config = parseUrlConfig($locationStore.search, $locationStore.hash);
  return pof(dynamicConfigSchema, config, {} as DynamicConfig);
});


export function navigate(route: string) {
  history.pushState(null, '', route);
  writableLocationStore.set(location);
}
