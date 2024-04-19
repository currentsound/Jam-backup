<script lang="ts">
    import animateEmoji from "$lib/client/utils/animate-emoji";
    import {onMount} from "svelte";

    export let className: string;
    export let emoji: string;
    let element: HTMLElement;
    onMount(() => {
        animateEmoji(element);
    })
</script>

<div
        bind:this={element}
        class={className}
        style="align-self: center;"
    >
{emoji}
</div>
