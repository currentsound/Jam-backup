<script lang="ts">
import EnterRoom from './EnterRoom.svelte';
import RoomHeader from './RoomHeader.svelte';
import {openModal} from '$lib/client/stores/modals';
import {EditRoomModal} from './EditRoom.svelte';
import useWakeLock from '../lib/use-wake-lock';
import AudienceAvatar from './avatar/AudienceAvatar';
import StageAvatar from './avatar/StageAvatar';
import Container from './Container';
import Navigation from './Navigation';
import {userAgent} from '../lib/user-agent';
import {usePushToTalk, useCtrlCombos} from '../lib/hotkeys';
import {mqp} from "$lib/client/stores/tailwind-mqp";
import type {JamRoom} from "$lib/types";

const inWebView =
  userAgent.browser?.name !== 'JamWebView' &&
  (userAgent.browser?.name === 'Chrome WebView' ||
    (userAgent.os?.name === 'iOS' &&
      userAgent.browser?.name !== 'Mobile Safari'));

  export let room: JamRoom;
  export let roomId: string;
  export let uxConfig;

  useWakeLock();
  usePushToTalk();
  useCtrlCombos();


  let myInfo = myIdentity.info;
  let hasEnteredRoom = inRoom === roomId;

  let [editRole, setEditRole] = useState(null);
  let [editSelf, setEditSelf] = useState(false);

  let {
    name,
    description,
    schedule,
    logoURI,
    buttonURI,
    buttonText,
    speakers,
    moderators,
    closed,
    stageOnly,
    shareUrl,
  } = room || {};

  let myPeerId = myInfo.id;
  let stagePeers = stageOnly
    ? peers
    : (speakers ?? []).filter(id => peers.includes(id));
  let audiencePeers = stageOnly
    ? []
    : peers.filter(id => !stagePeers.includes(id));

  let {noLeave} = uxConfig;

</script>
{#if !iMayEnter}
  <EnterRoom roomId={roomId} name={name} forbidden={true} />

{:else if !iModerate && closed}
  <EnterRoom
          roomId={roomId}
          name={name}
          description={description}
          schedule={schedule}
          logoURI={logoURI}
          closed={closed}
          buttonURI={buttonURI}
          buttonText={buttonText}
  />

  {:else if !hasEnteredRoom}
  <EnterRoom
          roomId={roomId}
          name={name}
          description={description}
          schedule={schedule}
          logoURI={logoURI}
  />

  {:else}

    <Container style={{display: 'flex', flexDirection: 'column'}}>
      <div
        class={mqp('flex flex-col pt-2 md:pt-10 md:p-10')}
        style={{flex: '1', overflowY: 'auto', minHeight: '0'}}
      >
        <div
          class={
            inWebView && !uxConfig.noWebviewWarning
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
        <RoomHeader
          colors={colors(room)}
          {...{name, description, logoURI, buttonURI, buttonText}}
          editRoom={
            iModerate && (() => openModal(EditRoomModal, {roomId, room}))
          }
        />

        <div class="">
          <div class="">
            <ol class="flex flex-wrap">
              {iSpeak && (
                <StageAvatar
                  key={myPeerId}
                  peerId={myPeerId}
                  {...{moderators, reactions, room}}
                  canSpeak={!hasMicFailed}
                  peerState={myPeerState}
                  info={myInfo}
                  onClick={() => setEditSelf(true)}
                  video={myVideo}
                  mirror={true}
                />
              )}
              {stagePeers.map(peerId => (
                <StageAvatar
                  key={peerId}
                  {...{moderators, room}}
                  {...{peerId, peerState, reactions}}
                  canSpeak={true}
                  peerState={peerState[peerId]}
                  info={identities[peerId]}
                  onClick={iModerate ? () => setEditRole(peerId) : undefined}
                  video={
                    remoteVideoStreams.find(s => s.peerId === peerId)?.stream
                  }
                />
              ))}
            </ol>
          </div>

          <br />
          {#if !$room.stageOnly}
              <h3 class="pl-4 pb-4" style={{color: colors(room).textLight}}>
                Audience
              </h3>
              <ol class="flex flex-wrap">
                {!iSpeak && (
                  <AudienceAvatar
                    {...{reactions, room}}
                    peerId={myPeerId}
                    peerState={myPeerState}
                    info={myInfo}
                    handRaised={handRaised}
                    onClick={() => setEditSelf(true)}
                  />
                )}
                {audiencePeers.map(peerId => (
                  <AudienceAvatar
                    key={peerId}
                    {...{peerId, peerState, reactions, room}}
                    peerState={peerState[peerId]}
                    info={identities[peerId]}
                    handRaised={iModerate && peerState[peerId]?.handRaised}
                    onClick={iModerate ? () => setEditRole(peerId) : undefined}
                  />
                ))}
              </ol>
            {/if}
        </div>

        <div style={{height: '136px', flex: 'none'}} />
      </div>

      <Navigation
        {...{
          roomId,
          room,
          editRole,
          setEditRole,
          editSelf,
          setEditSelf,
          noLeave,
        }}
      />
    </Container>
  {/if}
