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
  import {dynamicConfig} from "$lib/client/stores/location";


  const inWebView =
    userAgent.browser?.name !== 'JamWebView' &&
    (userAgent.browser?.name === 'Chrome WebView' ||
      (userAgent.os?.name === 'iOS' &&
        userAgent.browser?.name !== 'Mobile Safari'));


  const {state: {livekitRoom, jamRoom, me, participants, colors}} = getRoomContext();

  useWakeLock();
  usePushToTalk();
  useCtrlCombos();


  let myInfo = $me.info;

  let {
    speakers,
    closed,
    stageOnly,
  } = $jamRoom || {};



  let stageParticipants = stageOnly ? $participants : $participants.filter(p => speakers?.includes(p.identity))
  let audienceParticipants = stageOnly
     ? []
     : $participants.filter(p => !stageParticipants.map(p => p.identity).includes(p.identity));

  const {showActions, showRoleActions} = initializeActionsContext();

</script>

    <Container style="display: flex; flexDirection: column">
      <div
        class={mqp('flex flex-col pt-2 md:pt-10 md:p-10')}
        style="flex: 1; overflow-y: auto; min-height: 0"
      >
        <div
          class={
            inWebView && !$dynamicConfig.ux?.noWebviewWarning
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
        <div class="">
          <div class="">
            <ol class="flex flex-wrap">
              {#if $me.roles.speaker}
                <StageAvatar
                  participant={$me.participant}
                  canSpeak={!$me.hasMicFailed}
                  onClick={() => showActions.set(true)}
                />
              {/if}
              {#each stageParticipants as participant (participant.identity)}
                  <StageAvatar
                    participant={participant}
                    onClick={$me.roles.moderator ? () => showRoleActions.set(myInfo.id) : undefined}
                  />
              {/each}
            </ol>
          </div>

          <br />
          {#if !$jamRoom?.stageOnly}
              <h3 class="pl-4 pb-4" style="color: {$colors.textLight}">
                Audience
              </h3>
              <ol class="flex flex-wrap">
                {#if !$me }
                  <AudienceAvatar
                      participant={$me.participant}
                      onClick={() => showActions.set(true)}
                  />
                {/if}
                {#each audienceParticipants as participant (participant.identity)}
                  <AudienceAvatar
                          participant={participant}
                    onClick={$me.roles.moderator ? () => showRoleActions.set(participant.identity) : undefined}
                  />
                {/each}
              </ol>
            {/if}
        </div>

        <div style="height: 136px; flex: none" />
      </div>

      <Navigation />
    </Container>
