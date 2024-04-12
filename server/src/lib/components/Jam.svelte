<script lang="ts">

import {declareStateRoot} from './lib/state-tree';
import {ShowAudioPlayerToast} from './AudioPlayerToast.svelte';
import {createJam} from 'jam-core';
import {ShowInteractionModal} from './InteractionModal.svelte';
import {parseUrlConfig} from '$lib/client/utils/url-utils';
import {colors} from './lib/theme.js';

let urlConfig = parseUrlConfig(location.search, location.hash);

const [state, api] = createJam({
  jamConfig: window.jamConfig,
  initialProps: {roomId: window.existingRoomId ?? null},
  cachedRooms: window.existingRoomInfo && {
    [window.existingRoomId]: window.existingRoomInfo,
  },
  debug: !!urlConfig.debug,
});

declareStateRoot(ShowModals, null, {state});
</script>

export default function Jam(props) {
  return (
    <JamProvider state={state} api={api}>
      <JamUI {...props} />
    </JamProvider>
  );
}

