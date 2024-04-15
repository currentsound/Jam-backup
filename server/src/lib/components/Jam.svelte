<script lang="ts">
    import {getWidth, mqp, setContainerForWidth} from "$lib/client/stores/styles";
    import Modals from './Modals.svelte';
    import Start from "$lib/components/Start.svelte";
    import {toStyleString} from "$lib/client/utils/css";
    import {dynamicConfig, route} from "$lib/client/stores/location";
    import {onMount} from "svelte";
    import {getRoomContext} from "$lib/client/stores/room";
    import StartFromURL from "$lib/components/StartFromURL.svelte";

    export let style : Partial<CSSStyleDeclaration>;

    let container: HTMLElement;

    const width = getWidth();

    onMount(() => setContainerForWidth(container));

    const {state: {roomId, jamRoom}} = getRoomContext();

</script>

<div
        bind:this={container}
        class={mqp('jam sm:pt-12', $width)}
        style={toStyleString({
        position: 'relative',
        height: '100%',
        minHeight: '-webkit-fill-available',
        ...style,
      })}
>

    {#if !!$jamRoom}
        <code>{JSON.stringify($jamRoom)}</code>
    {:else}
        <StartFromURL {...{roomId, newRoom: $dynamicConfig.room}} />
    {/if}
    <Modals/>
</div>
