<script lang="ts">
    import {mqp} from '$lib/client/stores/styles';
    import {avatarUrl, displayName} from "$lib/client/utils/avatar";

    import {
        type IdentityInfo,
    } from "$lib/types.js";
    import {getParticipantContext, getRoomContext} from "$lib/client/stores/room";
    import Reactions from "$lib/components/avatar/Reactions.svelte";
    import TwitterHandle from "$lib/components/avatar/TwitterHandle.svelte";
    import type {Participant} from "livekit-client";


    export let participant: Participant;
    export let onClick: ((event: Event) => void) | undefined = undefined;


    const {state: {jamRoom}} = getRoomContext();
    const participantContext = getParticipantContext(participant, jamRoom);

    let info: IdentityInfo;
    let handRaised: boolean;

    $: {
        info = $participantContext.info;
        handRaised = $participantContext.state.handRaised;
    }




</script>
<li
        title={displayName(info, $jamRoom)}
        class={mqp('flex-none m-2 w-16 h-32 md:w-24 md:h-36 text-xs')}
        style={onClick ? "cursor: pointer" : undefined}
>
    <div class="relative flex justify-center">
        <img
                class={mqp(
    'human-radius w-16 h-16 md:w-24 md:h-24 border border-gray-300 object-cover'
    )}
                alt={displayName(info, $jamRoom)}
                src={avatarUrl(info, $jamRoom)}
                on:click={onClick}
        />
        <Reactions
                participantId={participant.identity}
                className={mqp(
    'absolute bg-white text-4xl md:text-6xl pt-3 md:pt-4 human-radius w-16 h-16 md:w-24 md:h-24 border text-center'
    )}
        />
        <div class={handRaised ? '' : 'hidden'}>
            <div
                    class={mqp(
    'absolute w-9 h-9 top-0 left-0 md:top-0 md:left-0 rounded-full bg-white text-lg border-2 border-gray-400 flex items-center justify-center'
    )}
            >
                ✋🏽
            </div>
        </div>
    </div>
    <div class="overflow-hidden whitespace-nowrap text-center mt-2">
        {displayName(info, $jamRoom)}
    </div>
    <TwitterHandle
            info={info}
            divClass="text-center mt-1"
            fontClass="text-xs"
    />
</li>
