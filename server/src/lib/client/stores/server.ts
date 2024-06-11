import type {ServerAPI, ServerContext, StaticConfig} from "$lib/types";
import {derived, type Stores} from "svelte/store";
import {createServerApi} from "$lib/client/api";
import {getContext, setContext} from "svelte";
import {identitiesStore} from "$lib/client/stores/identity";



export const initializeServerContext = (jamConfig: StaticConfig) => {
    const api = derived<Stores, ServerAPI>(
        [identitiesStore],
        ([$identities]) =>
            createServerApi($identities));

    const ctx: ServerContext = {
        config: jamConfig,
        api,
    };
    return setContext('server-context', ctx);
}

export const getServerContext = () => getContext<ServerContext>('server-context');
