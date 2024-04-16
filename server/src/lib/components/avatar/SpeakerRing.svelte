<script lang="ts">

    import {mqp} from "$lib/client/stores/styles";
    import type {Readable} from "svelte/store";

    export let isSpeaking: Readable<boolean>;
    export let roomColors;


</script>

<div
        class={mqp(
    'absolute human-radius border border-gray-300 w-20 h-20 md:w-28 md:h-28 object-cover'
    )}
        style="boxShadow: {$isSpeaking ? `0 0 0 4px ${roomColors.textSuperLight}` : 'none'} z-index: -10"
/>
