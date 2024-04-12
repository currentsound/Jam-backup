<script lang="ts">
    import {locationStore} from '$lib/client/stores/location-store';
    import Jam from './Jam.svelte';
    import {parsePath, parseUrlConfig} from '$lib/client/utils/url-utils';
    import {derived} from "svelte/store";

    const [route, dynamicConfig] = derived(locationStore, ($locationStore => {
        let {route, room} = parsePath($locationStore.pathname);
        let config = parseUrlConfig($locationStore.search, $locationStore.hash);
        config.room = {...room, ...(config.room ?? null)};
        return [route, config];
    }));


</script>


<Jam
        style={{height: '100vh'}}
        route={route}
        dynamicConfig={dynamicConfig}
/>
