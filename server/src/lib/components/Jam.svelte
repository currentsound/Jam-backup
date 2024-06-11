<script lang="ts">
    import {getWidth, mqp, setContainerForWidth} from "$lib/client/stores/styles";
    import Modals from './Modals.svelte';
    import {toStyleString} from "$lib/client/utils/css";
    import {onMount} from "svelte";
    import { initializeRoomContext} from "$lib/client/stores/room";
    import StartFromURL from "$lib/components/StartFromURL.svelte";
    import {ConnectionState} from "livekit-client";
    import Room from "$lib/components/Room.svelte";
    import EnterRoom from "$lib/components/EnterRoom.svelte";
    import Connecting from "$lib/components/Connecting.svelte";
    import type {DynamicConfig, JamRoom, StaticConfig} from "$lib/types";

    export let roomId: string;
    export let jamConfig: StaticConfig;
    export let dynamicConfig: DynamicConfig;
    export let jamRoom: JamRoom | undefined;


    let container: HTMLElement;

    const width = getWidth();

    onMount(() => setContainerForWidth(container));

    const {state: {jamRoom: jamRoomStore, livekitRoom}} = initializeRoomContext(roomId, jamConfig, jamRoom, dynamicConfig);

</script>

<div
        bind:this={container}
        class={mqp('jam sm:pt-12', $width)}
        style={toStyleString({
        position: 'relative',
        minHeight: '-webkit-fill-available',
        height: '100vh'
      })}
>
    {#if $livekitRoom.state === ConnectionState.Connected}
        <Room />
    {:else if $livekitRoom.state === ConnectionState.Connecting || $livekitRoom.state === ConnectionState.Reconnecting}
        <Connecting/>
    {:else}
        {#if !!$jamRoomStore}

            <EnterRoom />
        {:else}
            <StartFromURL />
        {/if}
    {/if}
    <Modals/>
</div>
