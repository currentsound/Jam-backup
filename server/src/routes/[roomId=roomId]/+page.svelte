<script lang="ts">
    import Jam from "$lib/components/Jam.svelte";
    import {page} from "$app/stores";
    import {onMount} from "svelte";
    import {parseUrlConfig} from "$lib/client/utils/url-utils.js";
    import {dynamicConfigSchema, type DynamicConfig} from "$lib/types.js";
    import {pof} from "$lib/utils.js";

    export let data;

    let dynamicConfig: DynamicConfig | undefined = undefined;

    onMount(() => {
        dynamicConfig = pof(dynamicConfigSchema, parseUrlConfig(location.search, location.hash), {}) as DynamicConfig;
    });

    const { roomId } = $page.params;
    const { jamConfig, roomData: { jamRoom }} = data;

</script>

{#if dynamicConfig}
    <Jam {roomId} {jamConfig} {jamRoom} {dynamicConfig}/>
{/if}
