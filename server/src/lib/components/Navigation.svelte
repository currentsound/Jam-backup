<script lang="ts">

import Actions from './actions/Actions.svelte';
import {breakpoints, getWidth} from '$lib/client/stores/styles';
import {toStyleString} from '$lib/client/utils/css';
import {MicOnSvg, MicOffSvg} from './svg';
import {getActionsContext, getRoomContext} from "$lib/client/stores/room";
import {isDark} from "$lib/client/utils/util";
import {LocalParticipant} from "livekit-client";
import RoleActions from "$lib/components/actions/RoleActions.svelte";
import {dynamicConfig} from "$lib/client/stores/location";

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

    let {state: {me, jamRoom, colors}, api} = getRoomContext();
    let {roles: {speaker}} = $me;

    let handRaised = false;
    let micOn = false;
    let micMuted = false;
    let showReactions = false;
    let isColorDark = isDark($colors.buttonPrimary);
    let {ux} = $dynamicConfig || {};
    let {showActions, showRoleActions} = getActionsContext();
    let width = getWidth();


  $: {
      micOn = $me.microphoneEnabled;
      micMuted = $me.microphoneMuted;
      handRaised = $me.state.handRaised
  }

  let talk = () => {
    if (micOn) {
        $api.toggleMicrophone();
    } else {
        ($me.participant as LocalParticipant).setMicrophoneEnabled(true);
    }
  }

  </script>
    <div
      class="z-10 p-4"
      style={toStyleString({
        ...navigationStyle,
        ...($width < breakpoints.sm ? navigationStyleSmall : null),
        width: $width < 720 ? '100%' : '700px',
        backgroundColor: $colors.background,
      })}
    >
      {#if $showRoleActions}
        <RoleActions
          participantId={$showRoleActions}
        />
      {/if}
      {#if $showActions} <Actions />{/if}
      <div class="flex flex-wrap space-x-0.5">
        <button
          on:click={speaker ? talk : () => $api.updateState({handRaised: !handRaised})}
          on:keyup={e => (e.key === ' ') && e.preventDefault()}
          class="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
          style={toStyleString({
            backgroundColor: $colors.buttonPrimary,
            color: isColorDark ? 'white' : 'black',
          })}
        >
          {#if speaker}
              {#if micOn && micMuted}
                  <MicOffSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={$colors.buttonPrimary}
                  />
                  &nbsp;Your&nbsp;microphone&nbsp;is&nbsp;off
              {:else if micOn && !micMuted}
                  <MicOnSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={$colors.buttonPrimary}
                  />
                  &nbsp;Your&nbsp;microphone&nbsp;is&nbsp;on
              {:else if !micOn}
                Allow&nbsp;microphone&nbsp;access
              {/if}
          {:else}
              {#if handRaised}
                Stop&nbsp;raising&nbsp;hand
              {:else}
                ✋🏽&nbsp;Raise&nbsp;hand&nbsp;to&nbsp;get&nbsp;on&nbsp;stage
              {/if}
          {/if}
        </button>
        {#if $jamRoom?.videoEnabled && speaker}
            <button
              class="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
              on:click={() => $api.toggleCamera()}
            >
              Camera {$me.participant.isCameraEnabled ? 'Off' : 'On'}
            </button>
            <button
              class="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
              on:click={$api.switchCamera}
            >
              Switch Camera
            </button>
        {/if}
      </div>
      <br />
      <div class="flex relative">
        <button
          on:click={() => showReactions = !showReactions}
          class="flex-grow select-none text-center h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline"
          style="background-color: {$colors.buttonSecondary}"
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
                on:click={() => {
                  $api.sendReaction(r);
                }}
                style="background-color: {$colors.buttonSecondary}"
              >
                {r}
              </button>
            {/each}
          </div>
        {/if}


        {#if !ux?.noLeave }
          <button
            class="flex-shrink ml-3 select-none h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline"
            on:click={$api.leaveRoom}
            style="background-color: {$colors.buttonSecondary}"
          >
            🖖🏽&nbsp;Leave
          </button>
        {/if}
      </div>
    </div>
