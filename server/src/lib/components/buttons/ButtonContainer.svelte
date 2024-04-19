<script lang="ts">
    import {mergeClasses} from '$lib/client/utils/util';
    import {toStyleString} from "$lib/client/utils/css";
    import type {CssInJs} from "postcss-js";

    export let className: string = '';
    export let style: CssInJs = {};
</script>

    <div
      class={mergeClasses('spaced-w-2', className)}
      style={toStyleString({lineHeight: '56px', ...style})}
    >
        <slot />
    </div>
