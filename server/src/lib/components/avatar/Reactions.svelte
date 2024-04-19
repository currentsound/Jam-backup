<script lang="ts">
    import AnimatedEmoji from "./AnimatedEmoji.svelte";
    import {getRoomContext} from "$lib/client/stores/room";
    import type {JamReaction} from "$lib/types";
    import {mergeClasses} from "$lib/client/utils/util";
    import {getWidth, mqp} from "$lib/client/stores/styles";

    export let participantId: string;
    export let className: string;

    const {state: {reactions}} = getRoomContext();
    const width = getWidth();

    const commonClasses = 'absolute bg-white human-radius border text-center';

    let participantReactions: JamReaction[];
    $: participantReactions = $reactions[participantId] || [];

</script>

{#each participantReactions as reaction (reaction.id)}

    <AnimatedEmoji
            emoji={reaction.reaction}
            className={mergeClasses(mqp(className, $width), commonClasses)}
    />
{/each}
