import {derived, readonly, writable} from "svelte/store";

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

export const pathStore =
  derived(locationStore, ($locationStore) =>
    $locationStore.pathname.split('/')
    .filter(Boolean));


export function navigate(route: string) {
  history.pushState(null, '', route);
  writableLocationStore.set(location);
}
