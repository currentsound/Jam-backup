<script lang="ts">
  import {ButtonContainer, SecondaryButton} from '../buttons';
  import {mqp} from "$lib/client/stores/styles";
  import {getActionsContext, getRoomContext} from "$lib/client/stores/room";
  import {Room, Track} from "livekit-client";
  import {onMount} from "svelte";

  const { showDeviceActions } = getActionsContext();
  const onCancel = () => showDeviceActions.set(false);

  const {state: {livekitRoom, jamRoom}, api} = getRoomContext();

  let currentMicrophoneId: string | undefined;
  let currentCameraId: string | undefined;

  let currentMicrophoneLabel: string;
  let currentCameraLabel: string;

  let queriedDevices = false;
  let showMicrophones = false;
  let showCameras = false;

  let audioDevices: MediaDeviceInfo[];
  let videoDevices: MediaDeviceInfo[];

  let {addSpeaker, removeSpeaker, leaveStage, startRecording, stopRecording, downloadRecording} = $api;

  const queryDevices = async () => {
    audioDevices = await Room.getLocalDevices('audioinput');
    videoDevices = await Room.getLocalDevices('videoinput');
    currentMicrophoneId = await $livekitRoom.localParticipant.getTrackPublication(Track.Source.Microphone)?.audioTrack?.getDeviceId();
    currentCameraId = await $livekitRoom.localParticipant.getTrackPublication(Track.Source.Camera)?.videoTrack?.getDeviceId();
    currentMicrophoneLabel = audioDevices.find(mdi => mdi.deviceId === currentMicrophoneId)?.label || 'default';
    currentCameraLabel = videoDevices.find(mdi => mdi.deviceId === currentCameraId)?.label || 'default';

    queriedDevices = true;
  };

  const setCamera = async (deviceId: string) => {
    await $livekitRoom.switchActiveDevice('videoinput', deviceId);
    await queryDevices();
    showCameras = false;
  }
  const setMicrophone = async (deviceId: string) => {
    await $livekitRoom.switchActiveDevice('audioinput', deviceId);
    await queryDevices();
    showMicrophones = false;
  }

  onMount(queryDevices);

</script>
    <div class={mqp('md:p-10')}>
      <h3 class="font-medium">Devices</h3>
      <br />
      <ButtonContainer>
        {#if !(showMicrophones || showCameras) }
          <SecondaryButton
            onClick={() => showMicrophones = true}
          >
            Current Microphone: {currentMicrophoneLabel}
          </SecondaryButton>
          <SecondaryButton
                  onClick={() => showCameras = true}
          >
            Current Camera: {currentCameraLabel}
          </SecondaryButton>
          <SecondaryButton light onClick={onCancel}>
            Cancel
          </SecondaryButton>
        {/if}
        {#if showMicrophones }
          {#each audioDevices as device }
            <SecondaryButton
                    onClick={() => setMicrophone(device.deviceId)}
            >
              {device.label}
            </SecondaryButton>
          {/each}
          <SecondaryButton light onClick={() => showMicrophones = false}>
            Cancel
          </SecondaryButton>
        {/if}
        {#if showCameras }
          {#each videoDevices as device }
            <SecondaryButton
                    onClick={() => setCamera(device.deviceId)}
            >
              {device.label}
            </SecondaryButton>
          {/each}
          <SecondaryButton light onClick={() => showCameras = false}>
            Cancel
          </SecondaryButton>
        {/if}
      </ButtonContainer>
      <br />
      <br />
      <hr />
    </div>
