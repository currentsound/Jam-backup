<script lang="ts">
  import type {Participant} from "livekit-client";
  import {mqp} from '$lib/client/stores/tailwind-mqp';
  import {displayName, avatarUrl} from "$lib/client/utils/avatar";
  import {
    getCameraTrack,
    getJamRoom,
    getParticipant,
    getParticipantReactions,
    getParticipantTracks
  } from '$lib/client/stores/livekit';

  import {colors} from "$lib/client/utils/theme";
  import SpeakerRing from './SpeakerRing';
  import Video from './Video';
  import Reactions from './Reactions';
  import MicOffSvg from '../svg/MicOffSvg';
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
  const info = getParticipantInfo(participantId);
  export let onClick: (event) => void;
  export let mirror: boolean;
  let isModerator = $room.moderators.includes(participantId);
  let roomColors: CompletedJamRoomColors = colors($room);

  const micMuted = !$participant.isMicrophoneEnabled;

</script>
      <li
        title={displayName($info, $room)}
        class="relative items-center space-y-1 mt-4 ml-2 mr-2"
        style={onClick ? {cursor: 'pointer'} : undefined}
      >
        <div
          class="human-radius p-1"
          style={{
            backgroundColor: roomColors.background,
          }}
        >
          <div
            class="human-radius p-1 relative flex justify-center"
            style={{backgroundColor: roomColors.background}}
          >
            <SpeakerRing participantId={participantId} roomColors={roomColors} />
            {#if video}
              <Video
                className={mqp(
                  'human-radius border border-gray-300 w-20 h-20 md:w-28 md:h-28 object-cover'
                )}
                stream={video}
                onClick={onClick}
                mirror={mirror}
              />

              {:else}
              <img
                class={mqp(
                  'human-radius border border-gray-300 w-20 h-20 md:w-28 md:h-28 object-cover'
                )}
                alt={displayName($info, $room)}
                src={avatarUrl($info, $room)}
                onClick={onClick}
              />
            )}
            {/if}
            <Reactions
              reactions={reactions}
              className={mqp(
                'absolute text-5xl md:text-7xl pt-4 md:pt-5 human-radius w-20 h-20 md:w-28 md:h-28 border text-center'
              )}
              style={{backgroundColor: roomColors.buttonPrimary}}
            />
          </div>
        </div>
        {#if !!micMuted || !canSpeak}
          <div
            class={mqp(
              'absolute w-10 h-10 right-0 top-12 md:top-20 rounded-full bg-white border-2 text-2xl border-gray-400 flex items-center justify-center'
            )}
            style={{backgroundColor: roomColors.textLight}}
          >
            <MicOffSvg
              className="w-5 h-5"
              fill={!canSpeak ? 'red' : undefined}
              stroke={roomColors.text}
            />
          </div>
        {/if}
        <div class={mqp('w-20 md:w-28 m-2')}>
          <div class="flex">
            <div class={mqp('flex-none text-center pl-1 w-20 md:w-28')}>
              <span
                class={mqp(
                  'text-sm md:text-base whitespace-nowrap w-22 md:w-30 font-medium'
                )}
                style="color: {roomColors.header}"
              >
                <span
                  class={
                    isModerator
                      ? 'flex-none inline-block leading-3 bg-gray-600 text-white w-3 h-3 rounded-full -ml-3'
                      : 'hidden'
                  }
                  style="background-color: {roomColors.text}, color: {roomColors.background}"

                >
                  <svg
                    class="inline-block w-2 h-2"
                    style={{margin: '-3px 0 0 0'}}
                    x="0px"
                    y="0px"
                    viewBox="0 0 1000 1000"
                    enable-background="new 0 0 1000 1000"
                    fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M894.5,633.4L663.3,500l231.1-133.4c39.1-22.6,52.4-72.5,29.9-111.6c-22.6-39.1-72.5-52.4-111.6-29.9L581.7,358.5V91.7c0-45.1-36.6-81.7-81.7-81.7c-45.1,0-81.7,36.6-81.7,81.7v266.9L187.2,225.1c-39.1-22.6-89-9.2-111.6,29.9c-22.6,39.1-9.2,89,29.9,111.6L336.7,500L105.5,633.4C66.5,656,53.1,705.9,75.6,745c22.6,39.1,72.5,52.4,111.6,29.9l231.1-133.4v266.9c0,45.1,36.6,81.7,81.7,81.7c45.1,0,81.7-36.6,81.7-81.7V641.5l231.1,133.4c39.1,22.6,89,9.2,111.6-29.9C946.9,705.9,933.5,656,894.5,633.4z" />
                  </svg>
                </span>{' '}
                {displayName($info, $room).substring(0, 12)}
              </span>
              <TwitterHandle
                info={$info}
                divClass="text-center"
                fontClass="text-sm"
              />
            </div>
          </div>
        </div>
      </li>
