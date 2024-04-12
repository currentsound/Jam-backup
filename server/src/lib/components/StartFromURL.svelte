<script lang="ts">
import Container from './Container.svelte';

const iOS =
  /^iP/.test(navigator.platform) ||
  (/^Mac/.test(navigator.platform) && navigator.maxTouchPoints > 4);

const macOS = /^Mac/.test(navigator.platform) && navigator.maxTouchPoints === 0;

  export let roomId: string;
  export let newRoom: boolean;

  let submit = e => {
    e.preventDefault();
    setProps('userInteracted', true);
    autoJoinOnce(); // => enter room as soon as create room succeeded
    // (^ causes room to be entered in the same microtask where also room info updates;
    // if we await createRoom the microtask queue is already emptied)
    createRoom(roomId, newRoom);
  };

</script>
    <Container>
      <div class={mqp('p-2 pt-60 md:p-10 md:pt-60')}>
        <h1>Start a Room</h1>
        <p class="mb-6">
          The room with ID{' '}
          <code class="text-gray-900 bg-yellow-100">{roomId}</code> does not
          exist yet.
        </p>

        <button
          onClick={submit}
          class="select-none h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300"
        >
          🌱 Start room
        </button>

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
      </div>
    </Container>
