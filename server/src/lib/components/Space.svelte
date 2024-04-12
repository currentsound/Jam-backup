<script lang="ts">
    export let className: string;
    export let type: 'w' | 'h';
    export let x: number;
</script>
<div class={mergeClasses(`${type}-${x}`, className)} {...$$restProps} />
