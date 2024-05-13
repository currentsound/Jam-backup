<script lang="ts">
    import type {LayoutData} from "./$types";
    import {initializeServerContext} from "$lib/client/stores/server";
    import {onMount} from "svelte";
    import {initializeLocationStore} from "$lib/client/stores/location";

    export let data: LayoutData;

    initializeServerContext(data.jamConfig);

    //onMount(initializeLocationStore)

</script>
<slot/>
