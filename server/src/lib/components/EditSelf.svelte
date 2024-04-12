<script lang="ts">
import {openModal} from './Modal';
import EditIdentity from './EditIdentity';
import {ButtonContainer, SecondaryButton} from './buttons';
import StreamingModal from './StreamingModal';

export let close;

  let stageOnly = !!room?.stageOnly;
  iSpeak = stageOnly || iSpeak;

</script>
    <div class={mqp('md:p-10')}>
      <h3 class="font-medium">Actions</h3>
      <br />
      <ButtonContainer>
        {!room.access?.lockedIdentities && (
          <SecondaryButton
            onClick={() => {
              openModal(EditIdentity);
              onCancel();
            }}
          >
            Edit Profile
          </SecondaryButton>
        )}
        {#if !stageOnly && iModerate && !iSpeak }
          <SecondaryButton
            onClick={() => addSpeaker(roomId, myId).then(onCancel)}
          >
            ↑ Move to Stage
          </SecondaryButton>
        {/if}
        {#if !stageOnly && iModerate && iSpeak }
          <SecondaryButton
            onClick={() => removeSpeaker(roomId, myId).then(onCancel)}
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
              if (isRecording) {
                stopRecording();
                downloadRecording('my-recording');
              } else {
                startRecording();
              }
              onCancel();
            }}
          >
            {isRecording ? 'Stop Room Recording' : 'Start Room Recording'}
          </SecondaryButton>
        {/if}
        {#if iModerate }
          <SecondaryButton
            onClick={() => {
              if (isPodcasting) {
                stopPodcastRecording();
              } else {
                startPodcastRecording();
              }
              onCancel();
            }}
          >
            {isPodcasting
              ? 'Stop Podcast Recording'
              : 'Start Podcast Recording'}
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
