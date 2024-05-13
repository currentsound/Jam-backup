<script lang="ts">
    import Container from "$lib/components/Container.svelte";

    export let text = 'Connecting';
</script>

<Container>
    <div class="flex h-full w-full items-center justify-center" style="height: 100%">
        <div>{text} ... </div>
    </div>
</Container>
