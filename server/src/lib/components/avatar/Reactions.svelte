<script lang="ts">
    import AnimatedEmoji from "./AnimatedEmoji.svelte";
    import {getRoomContext} from "$lib/client/stores/room";

    export let participantId: string;
    export let className: string;
    export let style: string = '';

    const {state: {reactions}} = getRoomContext();

    const participantReactions = $reactions[participantId] || [];

</script>

{#each participantReactions as reaction (reaction.id)}

    <AnimatedEmoji
            key={reaction.id}
            emoji={reaction.reaction}
            className={className}
            style="align-self: center; {style}"
    />
{/each}
