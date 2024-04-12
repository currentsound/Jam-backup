<script lang="ts">

import EditRole, {EditSelf} from './EditRole.svelte';
import {breakpoints, getWidthContext} from '$lib/client/stores/tailwind-mqp';
import {colors} from '$lib/client/utils/theme';
import {toStyleString} from '$lib/client/utils/css';
import {openModal} from '$lib/client/stores/modals';
import InfoModal from './InfoModal.svelte';
import MicOffSvg from './svg/MicOffSvg';
import MicOnSvg from './svg/MicOnSvg';

const reactionEmojis = ['❤️', '💯', '😂', '😅', '😳', '🤔'];

let navigationStyle = {
  position: 'fixed',
  bottom: '0',
  marginLeft: '-15px',
  flex: 'none',
  borderLeft: '2px solid lightgrey',
  borderRight: '2px solid lightgrey',
};

let navigationStyleSmall = {
  padding: '0 22px 22px 22px',
  marginLeft: '-12px',
  boxSizing: 'border-box',
  borderLeft: '0px',
  borderRight: '0px',
};

// export default function Navigation({
//   roomId,
//   room,
//   editRole,
//   setEditRole,
//   editSelf,
//   setEditSelf,
//   noLeave,
// }) {
//   const [
//     state,
//     {leaveRoom, sendReaction, retryMic, setProps, switchCamera, setCameraOn},
//   ] = useJam();
//   let [myAudio, micMuted, handRaised, iSpeak, myVideo] = use(state, [
//     'myAudio',
//     'micMuted',
//     'handRaised',
//     'iAmSpeaker',
//     'myVideo',
//   ]);

  export let editRole;
  export let editSelf;

  const myInfo = getMyInfo();
  const myState = getMyState();

  let micOn = myAudio?.active;

  let showReactions = false;

  const room = getRoom();

  let {speakers, moderators, stageOnly} = $room;

  const roomColors = colors($room);

  let isColorDark = isDark(roomColors.buttonPrimary);

  let width = getWidthContext();

  let backgroundColor = roomColors.background;

  let talk = () => {
    if (micOn) {
      setProps('micMuted', !micMuted);
    } else {
      retryMic();
    }
  }

  </script>
    <div
      class="z-10 p-4"
      style={toStyleString({
        ...navigationStyle,
        ...($width < breakpoints.sm ? navigationStyleSmall : null),
        width: $width < 720 ? '100%' : '700px',
        backgroundColor,
      })}
    >
      {#if editRole}
        <EditRole
          peerId={editRole}
          speakers={speakers}
          moderators={moderators}
          stageOnly={stageOnly}
          onCancel={() => setEditRole(null)}
        />
      {/if}
      {#if editSelf} <EditSelf onCancel={() => closeEditSelf()} />{/if}
      <div class="flex flex-wrap space-x-0.5">
        <button
          on:click={iSpeak ? talk : () => setProps('handRaised', !handRaised)}
          on:keyup={e => (e.key === ' ') && e.preventDefault()}
          class="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
          style={toStyleString({
            backgroundColor: roomColors.buttonPrimary,
            color: isColorDark ? 'white' : 'black',
          })}
        >
          {#if iSpeak}
              {#if micOn && micMuted}
                  <MicOffSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={roomColors.buttonPrimary}
                  />
                  &nbsp;Your&nbsp;microphone&nbsp;is&nbsp;off
              {/if}
              {#if micOn && !micMuted}
                  <MicOnSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={roomColors.buttonPrimary}
                  />
                  &nbsp;Your&nbsp;microphone&nbsp;is&nbsp;on
              {/if}
              {#if micOn}
                Allow&nbsp;microphone&nbsp;access
              {/if}
          {/if}
          {#if !iSpeak}
              {#if handRaised}
                Stop&nbsp;raising&nbsp;hand
              {:else}
                ✋🏽&nbsp;Raise&nbsp;hand&nbsp;to&nbsp;get&nbsp;on&nbsp;stage
              {/if}
          {/if}
        </button>
        {#if room.videoEnabled && iSpeak}
            <button
              class="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
              onClick={() => setCameraOn(!myVideo)}
            >
              Camera {!!myVideo ? 'Off' : 'On'}
            </button>
            <button
              class="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
              onClick={switchCamera}
            >
              Switch Camera
            </button>
        {/if}
      </div>
      <br />
      <div class="flex relative">
        <button
          onClick={() => setShowReactions(s => !s)}
          class="flex-grow select-none text-center h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline"
          style={{backgroundColor: roomColors.buttonSecondary}}
        >
          <svg
            class="w-6 h-6 inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="{2}"
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        {#if showReactions}
          <div class="text-4xl w-64 flex-shrink text-black text-center bg-gray-200 rounded-lg absolute left-0 bottom-14">
            {#each reactionEmojis as r}
              <button
                class="m-2 p-2 human-radius select-none px-3"
                onClick={() => {
                  sendReaction(r);
                }}
                style="background-color: {roomColors.buttonSecondary}"
              >
                {r}
              </button>
            {/each}
          </div>
        {/if}

        <button
          onClick={() => {
            openModal(InfoModal, {roomId, room});
          }}
          class="hidden ml-3 select-none h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline"
          style={{backgroundColor: roomColors.buttonSecondary}}
        >
          <svg
            class="w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="{2}"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {#if !noLeave }
          <button
            class="flex-shrink ml-3 select-none h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline"
            onClick={() => leaveRoom()}
            style="backgroundColor: {roomColors.buttonSecondary}"
          >
            🖖🏽&nbsp;Leave
          </button>
        {/if}
      </div>
    </div>
