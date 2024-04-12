<script lang="ts">

  let [myId, roomId] = use(state, ['myId', 'roomId']);
  let mqp = useMqParser();
  let [myAdminStatus] = useApiQuery(`/admin/${myId}`, {fetchOnMount: true});
  let [peerAdminStatus] = useApiQuery(`/admin/${peerId}`, {fetchOnMount: true});

  let isSpeaker = stageOnly || speakers.includes(peerId);
  let isModerator = moderators.includes(peerId);


</script>
    <div class={mqp('md:p-10')}>
      {#if myAdminStatus?.admin}
        <div>
          <h3 class="font-medium">Admin Actions</h3>
          <br />
          {#if peerAdminStatus?.admin }
            <button
              onClick={() => removeAdmin(peerId).then(onCancel)}
              class={
                'mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2'
              }
            >
              ❎️ Remove Admin
            </button>
          {:else}
            <button
              onClick={() => addAdmin(peerId).then(onCancel)}
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
            onClick={() => removeSpeaker(roomId, peerId).then(onCancel)}
            class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
          >
            ↓ Move to Audience
          </button>
              {:else}
          <button
            onClick={() => addSpeaker(roomId, peerId).then(onCancel)}
            class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
          >
            ↑ Invite to Stage
          </button>
              {/if}
      {/if}
      {#if isSpeaker && !isModerator}
        <button
          onClick={() => addModerator(roomId, peerId).then(onCancel)}
          class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
        >
          ✳️ Make Moderator
        </button>
      {/if}
      {#if isModerator}
        <button
          onClick={() => removeModerator(roomId, peerId).then(onCancel)}
          class="mb-2 h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 mr-2"
        >
          ❎ Demote Moderator
        </button>
      {/if}
      <button
        onClick={onCancel}
        class="mb-2 h-12 px-6 text-lg text-black bg-gray-100 rounded-lg focus:shadow-outline active:bg-gray-300"
      >
        Cancel
      </button>
      <br />
      <br />
      <hr />
    </div>
