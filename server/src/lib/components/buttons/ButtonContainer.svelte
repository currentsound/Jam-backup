<script lang="ts">
    import {mergeClasses} from '$lib/client/utils/util';

    export let className: string;
    export let style: Record<string, string>;
</script>

    <div
      class={mergeClasses('spaced-w-2', className)}
      style={{lineHeight: '56px', ...style}}
      {...$$restProps}
    />
