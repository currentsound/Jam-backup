import type {ServerContext, StaticConfig} from "$lib/types";
import {createServerApi} from "$lib/client/api";
import {getContext, setContext} from "svelte";



export const initializeServerContext = (jamConfig: StaticConfig) => {
    const api = createServerApi();

    const ctx: ServerContext = {
        config: jamConfig,
        api,
    };
    return setContext('server-context', ctx);
}

export const getServerContext = () => getContext<ServerContext>('server-context');
