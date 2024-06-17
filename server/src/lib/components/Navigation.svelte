<script lang="ts">

import Actions from './actions/Actions.svelte';
import RoleActions from "$lib/components/actions/RoleActions.svelte";
import DeviceActions from "$lib/components/actions/DeviceActions.svelte";
import {toStyleString} from '$lib/client/utils/css';
import {MicOnSvg, MicOffSvg, CamOffSvg, CamOnSvg} from './svg';
import {createParticipantContext, getActionsContext, getRoomContext} from "$lib/client/stores/room";
import {isDark} from "$lib/client/utils/util";
import {getMicrophoneTrack} from "$lib/client/utils/livekit";
import {Track} from "livekit-client";
import EditSvg from "./svg/EditSvg.svelte";
import {getWidth, mediaQuery} from "$lib/client/stores/styles";

const reactionEmojis = ['❤️', '💯', '😂', '😅', '😳', '🤔'];

    const width = getWidth();

    let {state: {livekitRoom, jamRoom, colors, dynamicConfig}, api} = getRoomContext();

    let localParticipant = $livekitRoom.localParticipant;
    let speaker = false;
    let handRaised = false;
    let micOn = false;
    let micMuted = false;
    let showReactions = false;
    let isColorDark = isDark($colors.buttonPrimary);
    let {showActions, showRoleActions, showDeviceActions} = getActionsContext();
    let noLeave: boolean;

  $: {
      localParticipant = $livekitRoom.localParticipant;

      let me = createParticipantContext($jamRoom)(localParticipant);

      micOn = !!localParticipant.getTrackPublication(Track.Source.Microphone);
      micMuted = getMicrophoneTrack(localParticipant)?.isMuted ?? true;
      handRaised = me.state.handRaised;
      speaker = me.roles.speaker;

      noLeave = !!dynamicConfig.ux?.noLeave;
  }

  let talk = () => {
    if (micOn) {
        $api.toggleMicrophone();
    } else {
        localParticipant.setMicrophoneEnabled(true).catch(console.log);
    }
  }

  </script>
    <div
      class="z-10 p-4 w-full"
    >
      {#if $showRoleActions}
        <RoleActions
          participantId={$showRoleActions}
        />
      {/if}
      {#if $showActions} <Actions />{/if}
        {#if $showDeviceActions} <DeviceActions />{/if}
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
                  {mediaQuery($width, 'md', '', `microphone is off`)}
              {:else if micOn && !micMuted}
                  <MicOnSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={$colors.buttonPrimary}
                  />
                  {mediaQuery($width, 'md', '', `microphone is on`)}
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
                {#if localParticipant.isCameraEnabled}
                <CamOnSvg
                        className="w-5 h-5 mr-2 opacity-80 inline-block"
                        stroke={$colors.buttonPrimary}
                />
                    {:else}
                    <CamOffSvg
                            className="w-5 h-5 mr-2 opacity-80 inline-block"
                            stroke={$colors.buttonPrimary}
                    />
                    {/if}
                {mediaQuery($width, 'md', '', `camera is ${localParticipant.isCameraEnabled ? 'on' : 'off'}`)}
            </button>
            <button
              class="select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
              on:click={() => showDeviceActions.set(true)}
            >
                <EditSvg />
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


        {#if !noLeave }
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
