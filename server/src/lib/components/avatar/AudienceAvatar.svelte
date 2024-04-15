<script lang="ts">
    import type {Participant} from "livekit-client";
    import {mqp} from '$lib/client/stores/styles';
    import {avatarUrl, displayName} from "$lib/client/utils/avatar";
    import {
        getCameraTrack,
        getJamRoom,
        getParticipant,
        getParticipantReactions,
        getParticipantTracks
    } from '$lib/client/stores/room';

    import {colors} from "$lib/client/utils/theme";
    import Reactions from './Reactions';
    import TwitterHandle from './TwitterHandle';
    import {TrackSource} from "@livekit/protocol";
    import {type CompletedJamRoomColors, identityInfoSchema} from "$lib/types.js";


    export let participantId: Participant;

    const room = getJamRoom();
    const participant = getParticipant(participantId);
    const participantTracks = getParticipantTracks(participantId);

    const video = getCameraTrack($participantTracks)?.mediaStream;

    let canSpeak = $participant.permissions?.canPublishSources.includes(TrackSource.MICROPHONE);
    const reactions = getParticipantReactions(participantId);
    const info = identityInfoSchema.safeParse(JSON.parse($participant.metadata)).data || {id: participantId};
    export let onClick: (event) => void;
    export let mirror: boolean;
    let isModerator = $room.moderators.includes(participantId);
    let roomColors: CompletedJamRoomColors = colors($room);

    const micMuted = !$participant.isMicrophoneEnabled;

</script>
<li
        title={displayName(info, room)}
        class={mqp('flex-none m-2 w-16 h-32 md:w-24 md:h-36 text-xs')}
        style={onClick ? {cursor: 'pointer'} : undefined}
>
    <div class="relative flex justify-center">
        <img
                class={mqp(
    'human-radius w-16 h-16 md:w-24 md:h-24 border border-gray-300 object-cover'
    )}
                alt={displayName(info, room)}
                src={avatarUrl(info, room)}
                onClick={onClick}
        />
        <Reactions
                reactions={reactions_}
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
        {displayName(info, room)}
    </div>
    <TwitterHandle
            info={info}
            divClass="text-center mt-1"
            fontClass="text-xs"
    />
</li>
