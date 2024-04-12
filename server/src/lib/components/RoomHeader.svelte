<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown';
  import {getJamRoom} from '$lib/client/stores/livekit';
  import MicOnSvg from './svg/MicOnSvg';
  import EditSvg from './svg/EditSvg';
  import Link from './markdown/Link';


  const room = getJamRoom();
  let colors = roomColors($room);
  export let editRoom: (() => void) | undefined = undefined;

  let isRecording = false;

</script>
<div class="flex room-header">
      {#if $room.logoURI}
        <div class="flex-none">
          <img
            alt="room icon"
            class="w-16 h-16 border rounded p-1 m-2 mt-0"
            src={$room.logoURI}
            style="objectFit: cover; display: none"
            onLoad={e => (e.target.style.display = '')}
          />
        </div>
      {/if}
      <div class="flex-grow">
        <h1 class="pl-2">{$room.name}</h1>
        <div class="pl-2 text-gray-500">
          <SvelteMarkdown
                  src={$room.description || ''}
                  renderers={{link: Link}}
          />
          <div
            class={$room.buttonURI && $room.buttonText ? 'call-to-action' : 'hidden'}
          >
            <a
              href={$room.buttonURI}
              class="select-none align-middle inline-block mt-2 py-2 px-6 text-lg bg-gray-200 border border-gray-300 rounded-lg focus:shadow-outline active:bg-gray-300"
              target="_blank"
              rel="noreferrer"
              style="color: {colors.text}"
            >
              {$room.buttonText}
            </a>
          </div>
        </div>
      </div>
      <div class="flex-none flex">
        {#if isRecording}
          <div
            aria-label="Recording"
            class="flex items-center w-8 h-6"
            style={{color: '#ff0000'}}
          >
            <MicOnSvg className="h-5" stroke="#ffffff" />
          </div>
        {/if}
        {#if !!editRoom}
          <div
            role="button"
            aria-label="Room settings"
            class="w-8 h-6 cursor-pointer"
            on:click={editRoom}
            style="color: {colors.text}"
          >
            <EditSvg />
          </div>
        {/if}
      </div>
    </div>
  );
}

