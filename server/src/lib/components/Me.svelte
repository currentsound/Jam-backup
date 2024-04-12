<script lang="ts">
    import Container from './Container';
    import {getMyInfo} from "$lib/client/stores/livekit";
    let myInfo = getMyInfo();
</script>
<Container style="height: initial; minHeight: 100%">
    <div class="p-6 md:p-10">
        <h1>Your Identity</h1>

        <p class="mt-4">
            This is your identity on {window.location.hostname}
        </p>

        <pre class="rounded-md bg-yellow-50 not-italic text-xs text-center py-2 -ml-2 mt-4 md:text-base">
          {$myInfo.id}
        </pre>

        <hr class="mt-14 mb-14"/>
    </div>
</Container>
