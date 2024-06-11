<script lang="ts">
  import RoomHeader from './RoomHeader.svelte';
  import AudienceAvatar from './avatar/AudienceAvatar.svelte';
  import StageAvatar from './avatar/StageAvatar.svelte';
  import Container from './Container.svelte';
  import Navigation from './Navigation.svelte';
  import {userAgent} from '$lib/client/utils/user-agent';
  import {usePushToTalk, useCtrlCombos} from '$lib/client/utils/hotkeys';
  import {mqp} from "$lib/client/stores/styles";
  import {useWakeLock} from "$lib/client/utils/use-wake-lock";
  import {getRoomContext, initializeActionsContext} from "$lib/client/stores/room";
  import type {LocalParticipant, Participant} from "livekit-client";

  const inWebView =
    userAgent.browser?.name !== 'JamWebView' &&
    (userAgent.browser?.name === 'Chrome WebView' ||
      (userAgent.os?.name === 'iOS' &&
        userAgent.browser?.name !== 'Mobile Safari'));


  const {state: {livekitRoom, jamRoom, colors, dynamicConfig}} = getRoomContext();

  useWakeLock();
  usePushToTalk();
  useCtrlCombos();



  let speakers: string[];
  let moderators: string[];
  let iModerate: boolean;
  let iSpeak: boolean;

  let closed: boolean;
  let stageOnly: boolean;

  let localParticipant: LocalParticipant;

  let allParticipants = [...$livekitRoom.remoteParticipants.values()];
  let stageParticipants: Participant[];
  let audienceParticipants: Participant[];

  let noWebviewWarning: boolean;

  $: {
    allParticipants = [...$livekitRoom.remoteParticipants.values()];
    localParticipant = $livekitRoom.localParticipant;

    speakers = $jamRoom?.speakers || [];
    moderators = $jamRoom?.moderators || [];

    iSpeak = speakers.includes(localParticipant.identity);
    iModerate = moderators.includes(localParticipant.identity);

    closed = !!$jamRoom?.closed;
    stageOnly = !!$jamRoom?.stageOnly;

    stageParticipants = stageOnly ? allParticipants : allParticipants.filter(p => speakers?.includes(p.identity))
    audienceParticipants = stageOnly
            ? []
            : allParticipants.filter(p => !stageParticipants.map(p => p.identity).includes(p.identity));

    noWebviewWarning = !!dynamicConfig.ux?.noWebviewWarning;
  }

  const {showActions, showRoleActions} = initializeActionsContext();

</script>

    <Container style="display: flex; flex-direction: column">
      <div
        class={mqp('flex flex-col pt-2 md:pt-10 md:p-10')}
        style="flex: 1; overflow-y: auto; min-height: 0"
      >
        <div
          class={
            inWebView && !noWebviewWarning
              ? 'rounded bg-blue-50 border border-blue-150 text-gray-600 ml-2 p-3 mb-3 inline text-center'
              : 'hidden'
          }
        >
          <svg
            class="w-5 h-5 inline mr-2 -mt-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="{2}"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Open in {userAgent.os?.name === 'iOS' ? 'Safari' : 'Chrome'} for best
          experience.
          <br />
          <a
            class="underline"
            href="https://gitlab.com/jam-systems/jam"
            target="_blank"
            rel="nofollow noreferrer"
          >
            Learn more
          </a>
          .
        </div>
        <div
          class={
            closed
              ? 'rounded bg-blue-50 border border-blue-150 text-gray-600 ml-2 p-3 mb-3 inline text-center'
              : 'hidden'
          }
        >
          <svg
            class="w-5 h-5 inline mr-2 -mt-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="{2}"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Room is closed
        </div>
        <RoomHeader/>
        <div>
            <ol class="flex flex-wrap">
              {#if iSpeak}
                <StageAvatar
                  participant={localParticipant}
                  canSpeak={!localParticipant.lastMicrophoneError}
                  onClick={() => showActions.set(true)}
                />
              {/if}
              {#each stageParticipants as participant (participant.identity)}
                  <StageAvatar
                    participant={participant}
                    onClick={iModerate ? () => showRoleActions.set(participant.identity) : undefined}
                  />
              {/each}
            </ol>

          <br />
          {#if !$jamRoom?.stageOnly}
              <h3 class="pl-4 pb-4" style="color: {$colors.textLight}">
                Audience
              </h3>
              <ol class="flex flex-wrap">
                {#if !iSpeak }
                  <AudienceAvatar
                      participant={localParticipant}
                      onClick={() => showActions.set(true)}
                  />
                {/if}
                {#each audienceParticipants as participant (participant.identity)}
                  <AudienceAvatar
                          participant={participant}
                    onClick={iModerate ? () => showRoleActions.set(participant.identity) : undefined}
                  />
                {/each}
              </ol>
            {/if}
        </div>

        <div style="height: 136px; flex: none" />
      </div>

      <Navigation />
    </Container>
