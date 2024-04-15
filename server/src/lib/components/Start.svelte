<script lang="ts">

    import {navigate, route} from '$lib/client/stores/location';
    import Container from './Container.svelte';
    import {colors} from '$lib/client/utils/theme';
    import type {JamRoom} from "$lib/types";
    import {userInteracted} from "$lib/client/stores/room";

    export let newRoom: Partial<JamRoom> = {stageOnly: false, videoEnabled: false};
    export let roomFromURIError = false;
    let urlRoomId = $route;

    let {stageOnly, videoEnabled} = newRoom;

    let submit = e => {
        e.preventDefault();
        userInteracted.set(true);
        const roomId = Math.random().toString(36).substring(2, 6);

        (async () => {
            let roomPosted = {
                stageOnly,
                videoEnabled,
            };
            let ok = await createRoom(roomId, roomPosted);
            if (ok) {
                if (urlRoomId !== roomId) navigate('/' + roomId);
                enterRoom(roomId);
            }
        })();
    };

    const humins = ['DoubleMalt', 'mitschabaude', '__tosh'].sort(() => Math.random() - 0.5);

    const roomColors = colors(newRoom);

</script>
<Container style={{height: 'initial', minHeight: '100%'}}>
    <div class="p-6 md:p-10">
        <div
                class={
            roomFromURIError
              ? 'mb-12 p-4 text-gray-700 rounded-lg border border-yellow-100 bg-yellow-50'
              : 'hidden'
          }
        >
            The Room ID{' '}
            <code class="text-gray-900 bg-yellow-200">{urlRoomId}</code> is
            not valid.
            <br/>
            <a
                    href="https://gitlab.com/jam-systems/jam"
                    target="_blank"
                    rel="noreferrer"
                    class="underline text-blue-800 active:text-blue-600"
            >
                Learn more about Room IDs
            </a>
            <br/>
            <br/>
            You can use the button below to start a room.
        </div>

        <h1>Start a Room</h1>

        <p>Click on the button below to start a room.</p>

        <form class="pt-6" onSubmit={submit}>
            <button
                    onClick={submit}
                    class="select-none h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline"
                    style={{backgroundColor: roomColors.buttonSecondary}}
            >
                🌱 Start room
            </button>
        </form>

        <hr class="mt-14 mb-14"/>

        {#if !window.jamConfig.hideJamInfo }
            <div>
                <h1>Welcome to Jam</h1>

                <div class="flex flex-row pt-4 pb-4">
                    <div class="flex-1 pt-6">
                        Jam is an <span class="italic">audio&nbsp;space</span>
                        <br/>
                        for chatting, brainstorming, debating, jamming,
                        <br/>
                        micro-conferences and more.
                        <br/>
                        <br/>
                        <a
                                href="https://gitlab.com/jam-systems/jam"
                                class="underline"
                                target="_blank"
                                rel="noreferrer"
                                style={{color: roomColors.link}}
                        >
                            Learn&nbsp;more&nbsp;about&nbsp;Jam.
                        </a>
                        <br/>
                        <br/>
                        <br/>
                        Jam <b class="font-semibold">Pro</b> (Early Access): Make
                        Jam your own.
                        <br/>
                        Set your own colors and logo, use your own domain.
                        <br/>
                        <br/>
                        <a
                                href="https://pro.jam.systems"
                                class="underline"
                                target="_blank"
                                rel="noreferrer"
                                style={{color: roomColors.link}}
                        >
                            Sign up for the Jam Pro Early Access Program.
                        </a>
                    </div>
                    <div class="flex-initial">
                        <img
                                class="mt-8 md:mt-4 md:mb-4 md:mr-8"
                                style={{width: 130, height: 130}}
                                alt="Jam mascot by @eejitlikeme"
                                title="Jam mascot by @eejitlikeme"
                                src="/img/jam.jpg"
                        />
                    </div>
                </div>
            </div>
        {/if}

        <div class="pt-32 text-xs text-gray-400 text-center">
            <a
                    href="https://gitlab.com/jam-systems/jam"
                    target="_blank"
                    rel="noreferrer"
            >
                built
            </a>{' '}
            w/ ♥ by{' '}



            {#each humins as humin}
            <span>
              {' '}
                <a
                        href={'https://twitter.com/' + humin}
                        target="_blank"
                        rel="noreferrer"
                >
                @{humin}
              </a>
            </span>
            {/each}{' '}
            in Berlin &amp; Vienna
        </div>
    </div>
</Container>
