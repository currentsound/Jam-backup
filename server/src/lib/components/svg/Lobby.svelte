<script lang="ts">

    import {getRoomState} from "$lib/client/stores/room";
    import {readable} from "svelte/store";

    const roomState = getRoomState();

    const roomExists = $page.data.roomData.jamRoom;



</script>

