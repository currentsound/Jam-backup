import type {ServerAPI, ServerContext, StaticConfig} from "$lib/types";
import {derived, type Stores} from "svelte/store";
import {initializeIdentities} from "$lib/client/stores/identity";
import {createServerApi} from "$lib/client/api";
import {getContext, setContext} from "svelte";
import {dynamicConfig} from "$lib/client/stores/location";



export const initializeServerContext = (jamConfig: StaticConfig) => {
    const api = derived<Stores, ServerAPI>(
        dynamicConfig,
        ($dynamicConfig, set) => {
            initializeIdentities().then(identities =>
                set(createServerApi(identities, $dynamicConfig, jamConfig)));
        });

    const ctx: ServerContext = {
        config: jamConfig,
        api,
    };
    return setContext('server-context', ctx);
}

export const getServerContext = () => getContext<ServerContext>('server-context');
