<script lang="ts">
  import {colors} from "$lib/client/utils/theme";
  import {breakpoints, getWidth} from "$lib/client/stores/styles";
  import {mergeClasses} from "$lib/client/utils/util";
  import {getRoomContext} from "$lib/client/stores/room";
  export let className: string = '';
  export let style: string = '';
  const width = getWidth()

  const jamRoom = getRoomContext()?.state?.jamRoom;

  let belowSm = $width < breakpoints.sm;
  let border = belowSm ? '0px' : '2px solid lightgrey';
  const roomColors = colors($jamRoom);
  const backgroundColor = roomColors.background;
  const color = roomColors.text;

  $: {
      belowSm = $width < breakpoints.sm;
      border = belowSm ? '0px' : '2px solid lightgrey';
  }
</script>
<style>
    div {
        margin: 0 auto;
        padding: 13px;
        height: 100%;
        box-sizing: border-box;
    }

</style>
    <div
      class={mergeClasses('container b-0', className)}
      style:background-color={backgroundColor}
      style:width={$width < 720 ? '100%' : '700px'}
      style:border-radius={belowSm ? '0' : '30px 30px 0 0'}
      style:border-top={border}
      style:border-left={border}
      style:border-right={border}
      style:border-bottom="0px"
      style:margin="0 auto"
      style:color={color}
      style:min-height="100%"
      style={style}
      {...$$restProps}
    >
        <slot />
    </div>
