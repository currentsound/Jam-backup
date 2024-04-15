<script lang="ts">

    import {mqp} from "$lib/client/stores/styles";
    import {getIsParticipantSpeaking} from "$lib/client/stores/room";

    export let participantId: string;
    export let roomColors;

    const isParticipantSpeaking = getIsParticipantSpeaking(participantId);

</script>

<div
        class={mqp(
    'absolute human-radius border border-gray-300 w-20 h-20 md:w-28 md:h-28 object-cover'
    )}
        style="boxShadow: {$isParticipantSpeaking ? `0 0 0 4px ${roomColors.textSuperLight}` : 'none'} z-index: -10"
/>
