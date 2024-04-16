<script lang="ts">
    import {getWidth, mqp, setContainerForWidth} from "$lib/client/stores/styles";
    import Modals from './Modals.svelte';
    import {toStyleString} from "$lib/client/utils/css";
    import {dynamicConfig, route} from "$lib/client/stores/location";
    import {onMount} from "svelte";
    import {getRoomContext} from "$lib/client/stores/room";
    import StartFromURL from "$lib/components/StartFromURL.svelte";
    import {ConnectionState} from "livekit-client";
    import Room from "$lib/components/Room.svelte";

    export let style : Partial<CSSStyleDeclaration>;

    let container: HTMLElement;

    const width = getWidth();

    onMount(() => setContainerForWidth(container));

    const {state: {roomId, jamRoom, livekitRoom}} = getRoomContext();

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
        {#if $livekitRoom.state === ConnectionState.Connected}
            <Room />
        {/if}
    {:else}
        <StartFromURL {...{roomId, newRoom: $dynamicConfig.room}} />
    {/if}
    <Modals/>
</div>
