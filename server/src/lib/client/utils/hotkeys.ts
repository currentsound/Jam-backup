
// unmute on space bar if currently muted
import {onMount} from "svelte";
import {get} from "svelte/store";
import type {Room} from "livekit-client";
import type {JamRoom, Me, RoomAPI} from "$lib/types";
import {getRoomContext} from "$lib/client/stores/room";

export const usePushToTalk = () => {

  const {state: {livekitRoom}} = getRoomContext();

  onMount(() => {
    const keys = [' ', 'Spacebar'];
    let isPressingKey = false;
    const unmuteOnSpaceDown = (event: KeyboardEvent) => {
      const $room = get(livekitRoom);
      if (
        keys.includes(event.key) &&
        !$room.localParticipant.isMicrophoneEnabled &&
        !event.repeat &&
        (event.target as HTMLElement)?.tagName !== 'INPUT' &&
          (event.target as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        isPressingKey = true;
        event.stopPropagation();
        event.preventDefault();
        $room.localParticipant.setMicrophoneEnabled(true).then();
      }
    };
    const muteOnSpaceUp = (event: KeyboardEvent) => {
      const $room = get(livekitRoom);
      if (
        isPressingKey &&
        keys.includes(event.key) &&
          $room.localParticipant.isMicrophoneEnabled &&
          (event.target as HTMLElement)?.tagName !== 'INPUT' &&
          (event.target as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        isPressingKey = false;
        event.stopPropagation();
        event.preventDefault();
        $room.localParticipant.setMicrophoneEnabled(false).then();
      }
    };
    document.addEventListener('keydown', unmuteOnSpaceDown);
    document.addEventListener('keyup', muteOnSpaceUp);
    return () => {
      document.removeEventListener('keydown', unmuteOnSpaceDown);
      document.removeEventListener('keyup', muteOnSpaceUp);
    };
  });
}

const handleCtrlCombo: Record<string, (livekitRoom: Room, jamRoom: JamRoom | undefined, me: Me, roomApi: RoomAPI) => Promise<void>> = {
  r: async (
      {isRecording},
      _,
      {iModerate},
      {startRecording, stopRecording, downloadRecording}
  ) => {
    if (!iModerate) return;
    if (isRecording) {
      stopRecording();
      downloadRecording();
    } else {
      startRecording();
    }
  },
};
const ctrlKeys = Object.keys(handleCtrlCombo);


export const useCtrlCombos = () => {
  const {state: {livekitRoom, jamRoom, me}, api} = getRoomContext();

  onMount(() => {
    const onKeyPress = (event: KeyboardEvent) => {
      const $livekitRoom = get(livekitRoom);
      const $jamRoom = get(jamRoom);
      const $me = get(me);
      const $roomApi = get(api);
      if (
        ctrlKeys.includes(event.key) &&
        event.ctrlKey &&
        event.altKey &&
        !event.repeat &&
          (event.target as HTMLElement)?.tagName !== 'INPUT' &&
          (event.target as HTMLElement)?.tagName !== 'TEXTAREA'
      ) {
        event.stopPropagation();
        event.preventDefault();
        handleCtrlCombo[event.key]?.($livekitRoom, $jamRoom, $me, $roomApi);
      }
    };
    document.addEventListener('keydown', onKeyPress);
    return () => {
      document.removeEventListener('keydown', onKeyPress);
    };
  });
}

