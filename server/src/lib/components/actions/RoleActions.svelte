<script lang="ts">

  import {onMount} from "svelte";

  import {getActionsContext, getRoomContext} from "$lib/client/stores/room";
  import {getServerContext} from "$lib/client/stores/server";
  import {mqp} from "$lib/client/stores/styles";

  export let participantId: string;

  const {showRoleActions} = getActionsContext();
  const onCancel = () => showRoleActions.set(undefined) ;

  const {state: {jamRoom, me}, api: roomApi} = getRoomContext();
  let {speakers, stageOnly, moderators} = $jamRoom || {};
  let {removeSpeaker, addSpeaker, removeModerator, addModerator} = $roomApi;

  const {api: serverApi} = getServerContext();
  let {isAdmin, addAdmin, removeAdmin} = $serverApi;


  const myId = $me.info.id;

  let iAmAdmin: boolean | undefined = undefined;
  let participantIsAdmin: boolean | undefined = undefined;

  let isSpeaker = stageOnly || speakers?.includes(participantId);
  let isModerator = moderators?.includes(participantId);

  let adminStatusFetched = false;

  onMount(async () => {
    isAdmin(myId).then(r => iAmAdmin = r);
    isAdmin(participantId).then(r => participantIsAdmin = r);
    adminStatusFetched = true;
  });


</script>
    <div class={mqp('md:p-10')}>
      {#if iAmAdmin && adminStatusFetched}
        <div>
          <h3 class="font-medium">Admin Actions</h3>
          <br />
          {#if participantIsAdmin }
            <button
              on:click={() => removeAdmin(participantId).then(onCancel)}
              class={
                'mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2'
              }
            >
              ❎️ Remove Admin
            </button>
          {:else}
            <button
              on:click={() => addAdmin(participantId).then(onCancel)}
              class={
                'mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2'
              }
            >
              👑️ Make Admin
            </button>
          {/if}
          <br />
          <br />
          <hr />
          <br />
        </div>
          {/if}
      <h3 class="font-medium">Moderator Actions</h3>
      <br />
      {#if !stageOnly}
          {#if isSpeaker }
          <button
            on:click={() => removeSpeaker(participantId).then(onCancel)}
            class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
          >
            ↓ Move to Audience
          </button>
              {:else}
          <button
            on:click={() => addSpeaker(participantId).then(onCancel)}
            class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
          >
            ↑ Invite to Stage
          </button>
              {/if}
      {/if}
      {#if isSpeaker && !isModerator}
        <button
          on:click={() => addModerator(participantId).then(onCancel)}
          class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
        >
          ✳️ Make Moderator
        </button>
      {/if}
      {#if isModerator}
        <button
          on:click={() => removeModerator(participantId).then(onCancel)}
          class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
        >
          ❎ Demote Moderator
        </button>
      {/if}
      <button
        on:click={onCancel}
        class="mb-2 h-12 px-6 text-lg text-black bg-gray-100 rounded-lg focus:shadow-outline active:bg-gray-300"
      >
        Cancel
      </button>
      <br />
      <br />
      <hr />
    </div>
