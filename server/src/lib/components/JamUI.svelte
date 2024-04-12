<script lang="ts">
import {setWidthContext, mqp} from "$lib/client/stores/tailwind-mqp";
import Modals from './Modal';

export let roomId = null;
export let defaultRoom = {};
export let dynamicConfig = {};
export let style;
export let className;
export let backgroundColor;

let container: HTMLElement | undefined;

const width = setWidthContext(container);

</script>

<div
        bind:self={container}
        class={mqp(mergeClasses('jam sm:pt-12', className), $width)}
        style={{
        position: 'relative',
        height: '100%',
        minHeight: '-webkit-fill-available',
        backgroundColor,
        ...(style || null),
      }}
>

{#if route === null}
    <Start newRoom={{...defaultRoom, ...dynamicConfig.room}} />
    {:else}
    <PossibleRoom
            roomId={route}
            newRoom={dynamicConfig.room}
            autoCreate={!!dynamicConfig.ux?.autoCreate}
            roomIdentity={dynamicConfig.identity}
            roomIdentityKeys={dynamicConfig.keys}
            uxConfig={dynamicConfig.ux ?? {}}
    />

{/if}
    <Modals />
</div>

    // set/unset room id
    useEffect(() => {
    let {autoJoin, autoRejoin, userInteracted} = dynamicConfig.ux ?? {};
    if (autoJoin !== undefined) {
    setProps('autoJoin', !!autoJoin);
}
    if (autoRejoin !== undefined) {
    setProps('autoRejoin', !!autoRejoin);
}
    if (userInteracted !== undefined) {
    setProps('userInteracted', !!userInteracted);
}
    setProps('roomId', roomId);
}, [roomId, dynamicConfig.ux, setProps]);

    // global styling
    // TODO: the color should depend on the loading state of GET /room, to not flash orange before being in the room
    // => color should be only set here if the route is not a room id, otherwise <PossibleRoom> should set it
    // => pass a setColor prop to PossibleRoom
    let {buttonPrimary} = colors(use(state, 'room'));
    let [width, , setContainer, mqp] = useProvideWidth();
    let backgroundColor = useMemo(
    () =>
    buttonPrimary && buttonPrimary !== '#4B5563'
    ? hexToRGB(buttonPrimary, '0.123')
    : undefined,
    [buttonPrimary]
    );

    return (
    <div
    ref={el => setContainer(el)}
    className={mqp(mergeClasses('jam sm:pt-12', className), width)}
    style={{
    position: 'relative',
    height: '100%',
    minHeight: '-webkit-fill-available',
    backgroundColor,
    ...(style || null),
}}
    {...props}
    >
    <WidthContext.Provider value={width}>
    {View}
    <Modals />
    </WidthContext.Provider>
    </div>
    );
}

const emptyObject = {};

function hexToRGB(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    if (alpha) {
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
} else {
    return `rgb(${r}, ${g}, ${b})`;
}
}

function ShowModals() {
    declare(ShowAudioPlayerToast);
    declare(ShowInteractionModal);
}
