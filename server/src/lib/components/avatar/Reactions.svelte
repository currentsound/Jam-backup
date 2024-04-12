<script lang="ts">
    import AnimatedEmoji from "./AnimatedEmoji";
    import type {JamReaction} from "$lib/types";

    export let reactions: JamReaction[];
    export let className: string;
</script>

{#each reactions as reaction (reaction.id)}

    <AnimatedEmoji
            key={reaction.id}
            emoji={reaction.reaction}
            className={className}
            style="align-self: 'center'"
    />
{/each}
