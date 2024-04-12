<script lang="ts">
    export let href: string;
    export let title: string;
    export let text: string;
</script>
<a href={href} title={title} target="_blank" rel="noopener noreferrer">
    {text}
</a>
