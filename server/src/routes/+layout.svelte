<script lang="ts">
    import type {LayoutData} from "./$types";
    import {initializeServerContext} from "$lib/client/stores/server";

    export let data: LayoutData;

    initializeServerContext(data.jamConfig);

</script>
<slot/>
