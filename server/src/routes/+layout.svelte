<script lang="ts">
    import type {LayoutData} from "./$types";
    import {onMount} from "svelte";
    import {migrateKeyPairs} from "$lib/client/stores/identity";
    import {initializeServerContext} from "$lib/client/stores/server";

    export let data: LayoutData;

    onMount(() => migrateKeyPairs())

    initializeServerContext(data.jamConfig);
</script>
<slot/>
