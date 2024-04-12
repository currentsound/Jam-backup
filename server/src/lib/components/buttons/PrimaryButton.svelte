<script lang="ts">
    import {mergeClasses} from "$lib/client/utils/util";

    export let className: string;
    const mergedClassName = mergeClasses(
        'h-12 px-6 text-lg text-white bg-gray-600 rounded-lg focus:shadow-outline active:bg-gray-600',
        className
    );
</script>

<button class={mergedClassName} {...$$restProps} />
