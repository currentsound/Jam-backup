<script lang="ts">
import EditIdentity from '../modals/EditIdentity.svelte';
import {ButtonContainer, SecondaryButton} from '../buttons';
import StreamingModal from '../modals/StreamingModal.svelte';
import {mqp} from "$lib/client/stores/styles";
import {createParticipantContext, getActionsContext, getRoomContext} from "$lib/client/stores/room";
import {openModal} from "$lib/client/stores/modals";

  const { showActions } = getActionsContext();
  const onCancel = () => showActions.set(false);

  const {state: {livekitRoom, jamRoom}, api} = getRoomContext();
  let stageOnly = !!$jamRoom?.stageOnly;

  let iModerate: boolean;
  let iSpeak: boolean;
  let id: string;

  $: {
    const me = createParticipantContext($jamRoom)($livekitRoom.localParticipant);
    iModerate = me.roles.moderator;
    iSpeak = me.roles.speaker;
    id = me.id;
  }

  let {addSpeaker, removeSpeaker, leaveStage, startRecording, stopRecording, downloadRecording} = $api;

</script>
    <div class={mqp('md:p-10')}>
      <h3 class="font-medium">Actions</h3>
      <br />
      <ButtonContainer>
        {#if !$jamRoom?.access?.identitiesLocked }
          <SecondaryButton
            onClick={() => {
              openModal(EditIdentity, {});
              onCancel();
            }}
          >
            Edit Profile
          </SecondaryButton>
        {/if}
        {#if !stageOnly && iModerate && !iSpeak }
          <SecondaryButton
            onClick={() => addSpeaker(id).then(onCancel)}
          >
            ↑ Move to Stage
          </SecondaryButton>
        {/if}
        {#if !stageOnly && iModerate && iSpeak }
          <SecondaryButton
            onClick={() => removeSpeaker(id).then(onCancel)}
          >
            ↓ Leave Stage
          </SecondaryButton>
        {/if}
        {#if !stageOnly && !iModerate && iSpeak }
          <SecondaryButton
            onClick={() => {
              leaveStage();
              onCancel();
            }}
          >
            ↓ Leave Stage
          </SecondaryButton>
        {/if}
        {#if iSpeak }
          <SecondaryButton
            onClick={() => {
              openModal(StreamingModal);
              onCancel();
            }}
          >
            Stream Audio
          </SecondaryButton>
        {/if}
        {#if iModerate }
          <SecondaryButton
            onClick={() => {
              if ($livekitRoom.isRecording) {
                stopRecording();
                downloadRecording();
              } else {
                startRecording();
              }
              onCancel();
            }}
          >
            {$livekitRoom.isRecording ? 'Stop Room Recording' : 'Start Room Recording'}
          </SecondaryButton>
        {/if}
        <SecondaryButton light onClick={onCancel}>
          Cancel
        </SecondaryButton>
      </ButtonContainer>
      <br />
      <br />
      <hr />
    </div>
