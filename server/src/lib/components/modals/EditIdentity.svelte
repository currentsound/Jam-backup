<script lang="ts">
import Modal from './Modal.svelte';
import {mqp} from "$lib/client/stores/styles";
import type {VerifiableIdentity} from "$lib/types";
import {getRoomContext} from "$lib/client/stores/room";

function addTwitter(identities: VerifiableIdentity[], handle: string | undefined, tweet: string | undefined) {
  if (!handle) return;
  if (handle.includes('/')) {
    handle = handle.split('/').pop() || '';
  }
  handle = handle.replace(/[^0-9a-z-A-Z_]/g, '');
  identities.push({type: 'twitter', id: handle, verificationInfo: tweet || ''});
}

  export let close: () => void;

  const {state: {me}, api} = getRoomContext();

  let updateInfo = $api.updateInfo;

  let info = $me.info;
  let id = info.id;
  let name = info?.name;
  let twitterIdentity = info?.identities?.find(i => i.type === 'twitter');
  let twitter = twitterIdentity?.id;
  let tweetInput = twitterIdentity?.verificationInfo;

  let tweet = twitterIdentity?.verificationInfo;

  let showTwitterVerify = false;
  let files: FileList;

  let submit = async (e: Event) => {
    e.preventDefault();

    let identities = info.identities || [];
    addTwitter(identities, twitter, tweetInput);

    const selectedFile = files?.[0];



    if (selectedFile) {
      let reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onloadend = async () => {
        e.preventDefault();
        let avatar = reader.result as string;
        let ok = await updateInfo({id, name, avatar, identities});
        if (ok) close();
      };
    } else {
      let ok = await updateInfo({id, name, identities});
      if (ok) close();
    }
  };
  let cancel = (e: Event) => {
    e.preventDefault();
    close();
  };
</script>
   <Modal close={close}>
      <h1>Edit Profile</h1>
      <br />
      <form on:submit={submit}>
        <input
          class="rounded placeholder-gray-400 bg-gray-50 w-48"
          type="text"
          placeholder="Display name"
          name="display-name"
          bind:value={name}
        />
        <div class="p-2 text-gray-500 italic">
          {`What's your name?`}
          <span class="text-gray-300"> (optional)</span>
        </div>
        <br />
        <input
          type="file"
          accept="image/*"
          bind:files
          class="edit-profile-file-input rounded placeholder-gray-400 bg-gray-50 w-72"
        />
        <div class="p-2 text-gray-500 italic">
          Set your profile picture
          <span class="text-gray-300"> (optional)</span>
        </div>
        <br />
        <input
          class="rounded placeholder-gray-400 bg-gray-50 w-48"
          type="text"
          placeholder="@twitter"
          name="twitter"
          bind:value={twitter}
        />
        <span class="text-gray-500">
          <svg
            class={
              tweet
                ? 'text-blue-600 pl-2 mr-1 h-6 w-6 inline-block'
                : 'pl-2 mr-1 h-6 w-6 inline-block'
            }
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="{2}"
              d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"
            />
          </svg>
          <span>
            <button on:click={() => showTwitterVerify = !showTwitterVerify}>
              <span
                class={tweet ? 'hidden' : 'underline'}
                style="cursor: pointer"

              >
                verify
              </span>
            </button>
            <button on:click={() => showTwitterVerify = !showTwitterVerify}>
              <span
                class={tweet ? '' : 'hidden'}
              >
                verified
              </span>
            </button>
          </span>
        </span>

        <div class="p-2 text-gray-500 italic">
          {`Set your twitter user name`}
          <span class="text-gray-300"> (optional)</span>
          <br />
        </div>

        <div
          class={showTwitterVerify ? 'p-2 text-gray-500 italic' : 'hidden'}
        >
          <p>
            <a
              class="underline not-italic text-blue-600 hover:text-blue-800 visited:text-purple-600"
              href={
                'https://twitter.com/intent/tweet?text=' +
                encodeURI('did:i:') +
                id +
                '%0a%0aThis is my public key on 🍞 Jam%0a%0a(@jam_systems // https://jam.systems)'
              }
              target="_blank"
              rel="noreferrer"
            >
              Tweet your Jam public key
            </a>
            <br />
            to verify your twitter account
          </p>
          <pre
            style="font-size: 0.7rem"
            class={mqp(
              'rounded-md bg-yellow-50 not-italic text-xs text-center py-2 -ml-2 mt-2 md:text-base'
            )}
          >
            {id}
          </pre>

          <input
            class="tweet mt-2 -ml-2 rounded placeholder-gray-400 bg-gray-50 w-72"
            type="text"
            placeholder="Tweet URL"
            name="tweet"
            bind:value={tweetInput}
          />
        </div>

        <br />
        <hr />
        <br />
        <div class="flex">
          <button
            on:click={submit}
            class="flex-grow mt-5 h-12 px-6 text-lg text-white bg-gray-600 rounded-lg focus:shadow-outline active:bg-gray-600 mr-2"
          >
            Done
          </button>
          <button
            on:click={cancel}
            class="flex-none mt-5 h-12 px-6 text-lg text-black bg-gray-100 rounded-lg focus:shadow-outline active:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
