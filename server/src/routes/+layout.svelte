<script lang="ts">
    import type {LayoutData} from "./$types";
    import {onMount} from "svelte";
    import {initializeIdentities} from "$lib/client/stores/identity";
    import {initializeServerContext} from "$lib/client/stores/server";

    export let data: LayoutData;

    onMount(() => initializeIdentities())

    initializeServerContext(data.jamConfig);
</script>
<slot/>
