<script lang="ts">
    import {modals} from '$lib/client/stores/modals';


</script>


{#each $modals as modal}
    <svelte:component this={modal.componentType} ...modal.props></svelte:component>
{/each}
