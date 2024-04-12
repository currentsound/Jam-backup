<script lang="ts">
import Container from './Container';
import RoomHeader from './RoomHeader';
import {colors} from '$lib/client/utils/theme';
import {mqp} from "$lib/client/stores/tailwind-mqp";

const iOS =
  /^iP/.test(navigator.platform) ||
  (/^Mac/.test(navigator.platform) && navigator.maxTouchPoints > 4);

const macOS = /^Mac/.test(navigator.platform) && navigator.maxTouchPoints === 0;

export let roomId;
export let room;
export let forbidden;
  const roomColors = colors(room);
</script>
    <Container>
      <div class={mqp('p-2 pt-60 md:p-10 md:pt-60')}>
        <RoomHeader
          colors={roomColors}
          {...{name, description, logoURI, buttonURI, buttonText}}
        />
        <p class="hidden pt-4 pb-4">
          🗓 February 3rd 2021 at ⌚️ 14:06 (Vienna Time)
        </p>
        {#if otherDevice}
          <div
            class={
              'mt-5 mb--1 p-4 text-gray-700 rounded-lg border border-yellow-100 bg-yellow-50'
            }
          >
            <span class="text-gray-900 bg-yellow-200">Warning:</span> You
            already joined this room from a different device or browser tab.
            Click {`'`}
            Join{`'`} to switch to this tab.
          </div>
        {/if}
        {#if forbidden}
          <div
            class={
              'mt-5 mb--1 p-4 text-gray-700 rounded-lg border border-yellow-100 bg-yellow-50'
            }
          >
            <span class="text-gray-900 bg-yellow-200">Warning:</span>
            <br />
            You are not allowed to enter this room. Move along!
          </div>
        {/if}

        <button
          onClick={() => {
            setProps({userInteracted: true});
            enterRoom(roomId);
          }}
          class={
            closed || forbidden
              ? 'hidden'
              : 'mt-5 select-none w-full h-12 px-6 text-lg text-white bg-gray-600 rounded-lg focus:shadow-outline active:bg-gray-600'
          }
          style={{
            backgroundColor: roomColors.buttonPrimary,
            color: roomColors.background,
          }}
        >
          Join
        </button>

        <a
          class={
            schedule
              ? 'block mt-5 text-center h-12 p-3 px-6 text-lg text-gray-500'
              : 'hidden'
          }
          href={`/${roomId}.ics`}
          download={`${name || 'room'}.ics`}
        >
          🗓 Add to Calendar
        </a>

        <div class={iOS ? 'mt-40 text-gray-500 text-center' : 'hidden'}>
          🎧 Use headphones or earbuds
          <br />
          for the best audio experience on iOS
        </div>

        <div class={macOS ? 'mt-40 text-gray-500 text-center' : 'hidden'}>
          🎧 Use Chrome or Firefox instead of Safari
          <br />
          for the best audio experience on macOS
        </div>
        <button class="hidden h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300">
          ⏰ Alert me 5 min before
        </button>

        <button class="hidden h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300">
          🗓 Add this to my calendar
        </button>
      </div>
    </Container>
  );
}
