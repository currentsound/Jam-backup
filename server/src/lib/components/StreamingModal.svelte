<script lang="ts">
import Modal from './Modal';
import PrimaryButton from './buttons/PrimaryButton';
import SecondaryButton from './buttons/SecondaryButton';

  export let close: () => void;
  const submit = async e => {
    e.preventDefault();
    let file = getFile();
    set(state, 'audioFile', {file, name: file.name});
    close();
  };
</script>
    <Modal close={close}>
      <h1>Stream audio</h1>
      <br />
      <form onSubmit={submit} class="text-gray-500">
        <label class="block">
          <input
                  type="file"
                  accept="audio/*,.mp3,.wav,.m4a,.oga,.3gp,.3g2,.aiff,.mp4"
                  class={mergeClasses(
                    'rounded placeholder-gray-400 bg-gray-50',
                    width,
                    className
                  )}
                  {...$$restProps}
          />
          <p class="p-2 italic text-gray-500">
            Stream audio from file
          </p>
        </label>

        <br />
        <div class="spaced-w-2 flex">
          <PrimaryButton on:click={submit} className="flex-grow">
            Stream
          </PrimaryButton>
          <SecondaryButton light className="flex-none" on:click={close}>
            Cancel
          </SecondaryButton>
        </div>
      </form>
    </Modal>
