<script lang="ts">
  import SvelteMarkdown from 'svelte-markdown';
  import MicOnSvg from './svg/MicOnSvg.svelte';
  import EditSvg from './svg/EditSvg.svelte';
  import Link from './markdown/Link.svelte';
  import {getRoomContext} from "$lib/client/stores/room";
  import {colors} from '$lib/client/utils/theme';

  const {state: {jamRoom}} = getRoomContext();

  let roomColors = colors($jamRoom);
  export let editRoom: (() => void) | undefined = undefined;

  let isRecording = false;

</script>
<div class="flex room-header">
      {#if $jamRoom?.logoURI}
        <div class="flex-none">
          <img
            alt="room icon"
            class="w-16 h-16 border rounded p-1 m-2 mt-0"
            src={$jamRoom?.logoURI}
            style="objectFit: cover; display: none"
            on:load={e => console.log  }
          />
        </div>
      {/if}
      <div class="flex-grow">
        <h1 class="pl-2">{$jamRoom?.name}</h1>
        <div class="pl-2 text-gray-500">
          <SvelteMarkdown
                  source={$jamRoom?.description || ''}
                  renderers={{link: Link}}
          />
          <div
            class={$jamRoom?.buttonURI && $jamRoom?.buttonText ? 'call-to-action' : 'hidden'}
          >
            <a
              href={$jamRoom?.buttonURI}
              class="select-none align-middle inline-block mt-2 py-2 px-6 text-lg bg-gray-200 border border-gray-300 rounded-lg focus:shadow-outline active:bg-gray-300"
              target="_blank"
              rel="noreferrer"
              style="color: {roomColors.text}"
            >
              {$jamRoom?.buttonText}
            </a>
          </div>
        </div>
      </div>
      <div class="flex-none flex">
        {#if isRecording}
          <div
            aria-label="Recording"
            class="flex items-center w-8 h-6"
            style='color: #ff0000'
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
            style="color: {roomColors.text}"
          >
            <EditSvg />
          </div>
        {/if}
      </div>
    </div>
  );
}

