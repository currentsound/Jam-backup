<script lang="ts">
    import type {IdentityInfo} from '$lib/types';
    export let info: IdentityInfo;
    export let divClass: string;
    export let fontClass: string;
    let twitterIdentity = info?.identities?.find(i => i.type === 'twitter');
</script>
{#if twitterIdentity?.id}
    <div class={divClass}>
    <span class={fontClass}>
    <a
            class={
    twitterIdentity.verificationInfo
    ? 'text-blue-600 font-medium ml-1'
    : 'text-gray-500 font-medium ml-1'
    }
            style="text-decoration: 'none'; fontdweight: 'normal'"
            href="https://twitter.com/{twitterIdentity?.id.replace('@', '')}"
            target="_blank"
            rel="noreferrer"
    >
    @{twitterIdentity?.id.replace('@', '')}
    </a>
    </span>
    </div>
{/if}
