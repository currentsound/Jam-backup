<script lang="ts">
    import {mergeClasses} from "$lib/client/utils/util";

    export let className: string;
    export let light: boolean;

    let bgColor = light ? 'bg-gray-100' : 'bg-gray-200';
    
    const mergedClassName = mergeClasses(
        'h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline active:bg-gray-300',
        bgColor,
        className
    );
</script>

<button class={mergedClassName} {...$$restProps} />
