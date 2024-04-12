<script lang="ts">
  import {getJamRoom} from "$lib/client/stores/livekit";
  export let className: string;
  export let style: string;
  const room = getJamRoom();
  const width = getWidthContext()
  let belowSm = $width < breakpoints.sm;
  let border = belowSm ? '0px' : '2px solid lightgrey';
  const roomColors = colors($room);
  const backgroundColor = roomColors.background;
  const color = roomColors.text;
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
      style:width={width < 720 ? '100%' : '700px'}
      style:border-radius={belowSm ? '0' : '30px 30px 0 0'}
      style:border-top={border}
      style:border-left={border}
      style:border-right={border}
      style:border-bottom="0px"
      style:margin="0 auto"
      style:color={color}
      style={style}
      {...$$restProps}
    />
