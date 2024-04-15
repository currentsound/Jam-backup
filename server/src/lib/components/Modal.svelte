<script lang="ts">

    import Close from './svg/Close'
    import {mqp} from "$lib/client/stores/styles";

</script>


    <div
      class={mqp('p-0 sm:p-5 items-stretch sm:items-center')}
      style={{
        position: 'absolute',
        zIndex: '10',
        top: '0',
        left: '0',
        height: '100%',
        width: '100%',
        backgroundColor: '#00000033',
        display: 'flex',
      }}
      onClick={close}
    >
      <div
        class={mqp('relative p-1 pt-10 pb-10 sm:rounded-xl')}
        style={{
          flex: 'none',
          display: 'flex',
          flexDirection: 'column',
          margin: '0 auto',
          width: useMediaQuery('sm', '100%', '640px'),
          maxWidth: '100%',
          maxHeight: '100%',
          overflowY: 'hidden',
          backgroundColor: 'white',
        }}
        onClick={e => {
          e.stopPropagation();
        }}
      >
        <div class="absolute top-2 right-2">
          <div
            onClick={close}
            style={{padding: '0.75rem', borderRadius: '50%', cursor: 'pointer'}}
          >
            <Close />
          </div>
        </div>
        <div
          class={mqp('px-5 sm:px-8')}
          style={{
            flex: '0 1 auto',
            overflowY: 'auto',
            minHeight: '0',
          }}
        >
          <slot />
        </div>
      </div>
    </div>
