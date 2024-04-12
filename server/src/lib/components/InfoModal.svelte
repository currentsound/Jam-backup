<script lang="ts">
    import Modal from './Modal';
    export let close: () => void;
</script>
    <Modal close={close}>
      <div class="flex flex-row pt-4 pb-4">
        <div class="flex-1 pt-6">
          Jam is an <span class="italic">audio&nbsp;space</span>
          <br />
          for chatting, brainstorming, debating, jamming,
          <br />
          micro-conferences and more.
          <br />
          <br />
          <a
            href="https://gitlab.com/jam-systems/jam"
            class="underline text-blue-800 active:text-blue-600"
            target="_blank"
            rel="noreferrer"
          >
            Learn&nbsp;more&nbsp;about&nbsp;Jam.
          </a>
          <br />
          <br />
          <br />
          Jam <b class="font-semibold">Pro</b> (Early Access): Make Jam your
          own.
          <br />
          Set your own colors and logo, use your own domain.
          <br />
          <br />
          <a
            href="https://pro.jam.systems"
            class="underline text-blue-800 active:text-blue-600"
            target="_blank"
            rel="noreferrer"
          >
            Sign up for the Jam Pro Early Access Program.
          </a>
        </div>
        <div class="flex-initial">
          <img
            class="mt-8 md:mt-4 md:mb-4 md:mr-8"
            style={{width: 130, height: 130}}
            alt="Jam mascot by @eejitlikeme"
            title="Jam mascot by @eejitlikeme"
            src="/img/jam.jpg"
          />
        </div>
      </div>

    </Modal>
