<script lang="ts">

    import Close from '../svg/Close.svelte'
    import {getWidth, mediaQuery, mqp} from "$lib/client/stores/styles";
    import {toStyleString} from "$lib/client/utils/css";

    const width = getWidth();

    export let close: () => void;
</script>


    <div
      class={mqp('p-0 sm:p-5 items-stretch sm:items-center')}
      style={toStyleString({
        position: 'absolute',
        zIndex: '10',
        top: '0',
        left: '0',
        height: '100%',
        width: '100%',
        backgroundColor: '#00000033',
        display: 'flex',
      })}
      on:click={close}
    >
      <div
        class={mqp('relative p-1 pt-10 pb-10 sm:rounded-xl')}
        style={toStyleString({
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          width: mediaQuery($width, 'sm', '100%', '640px'),
          maxWidth: '100%',
          maxHeight: '100%',
          overflowY: 'hidden',
          backgroundColor: 'white',
        })}
        on:click={e => {
          e.stopPropagation();
        }}
      >
        <div class="absolute top-2 right-2">
          <div
            on:click={close}
            style="padding: 0.75rem; border-radius: 50%; cursor: pointer"
          >
            <Close color="black"/>
          </div>
        </div>
        <div
          class={mqp('px-5 sm:px-8')}
          style="flex: 0 1 auto; overflowY: auto; minHeight: 0"
        >
          <slot />
        </div>
      </div>
    </div>
