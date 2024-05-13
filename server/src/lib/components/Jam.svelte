<script lang="ts">
    import {getWidth, mqp, setContainerForWidth} from "$lib/client/stores/styles";
    import Modals from './Modals.svelte';
    import {toStyleString} from "$lib/client/utils/css";
    import {dynamicConfig} from "$lib/client/stores/location";
    import {onMount} from "svelte";
    import {getRoomContext} from "$lib/client/stores/room";
    import StartFromURL from "$lib/components/StartFromURL.svelte";
    import {ConnectionState} from "livekit-client";
    import Room from "$lib/components/Room.svelte";
    import EnterRoom from "$lib/components/EnterRoom.svelte";
    import Connecting from "$lib/components/Connecting.svelte";

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
        minHeight: '-webkit-fill-available',
        height: '100vh'
      })}
>
    {#if $livekitRoom.state === ConnectionState.Connected}
        <Room />
    {:else if $livekitRoom.state === ConnectionState.Connecting || $livekitRoom.state === ConnectionState.Reconnecting}
        <Connecting/>
    {:else}
        {#if !!$jamRoom}

            <EnterRoom />
        {:else}
            <StartFromURL {...{roomId, newRoom: $dynamicConfig.room}} />
        {/if}
    {/if}
    <Modals/>
</div>
