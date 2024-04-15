import type {ServerContext, StaticConfig} from "$lib/types";
import {derived} from "svelte/store";
import {identitiesStore} from "$lib/client/stores/identity";
import {createServerApi} from "$lib/client/api";
import {getContext, setContext} from "svelte";
import {dynamicConfig} from "$lib/client/stores/location";



export const initializeServerContext = (jamConfig: StaticConfig) => {
    const api = derived(
        [identitiesStore, dynamicConfig],
        ([$identities, $dynamicConfig]) =>
            createServerApi($identities._default, $dynamicConfig, jamConfig));

    const ctx: ServerContext = {
        config: jamConfig,
        api,
    };
    return setContext('server-context', ctx);
}

export const getServerContext = () => getContext<ServerContext>('server-context');
