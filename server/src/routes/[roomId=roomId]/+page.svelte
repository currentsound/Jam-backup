<script>
    import Jam from "$lib/components/Jam.svelte";
    import {initializeRoomContext} from "$lib/client/stores/room";
    import {page} from "$app/stores";

    export let data;

    initializeRoomContext(
        $page.params.roomId,
        data.jamConfig,
        data.roomData.jamRoom,
    );

</script>

<Jam style={{height: '100vh'}}/>
