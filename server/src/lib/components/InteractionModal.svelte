<script lang="ts">
import Modal from './Modal';
import PrimaryButton from './buttons/PrimaryButton';


</script>
    <Modal close={close}>
      <h1>Allow playing sound</h1>
      <br />
      <p>Click OK to allow our page to play sound.</p>
      <br />
      <p>
        <PrimaryButton
          onClick={() => {
            retryAudio();
            close();
          }}
        >
          OK
        </PrimaryButton>
      </p>
    </Modal>
