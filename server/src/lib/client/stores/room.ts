import {Participant, ParticipantEvent, Room, RoomEvent, Track} from "livekit-client";
import {derived, type Readable, readable, readonly, type Stores, type Updater, writable} from "svelte/store";
import {getContext, setContext} from "svelte";
import {
    type ActionsContext, type DynamicConfig,
    type JamMessage,
    type JamReaction,
    type JamRoom,
    type ParticipantContext,
    type RoomContext,
    type StaticConfig
} from "$lib/types";
import {createRoomApi} from "$lib/client/api";
import {getCameraTrack, getMetadata, getMicrophoneTrack, toJamRoom} from "$lib/client/utils/livekit";
import {identitiesStore, importRoomIdentity} from "$lib/client/stores/identity";
import {colors} from "$lib/client/utils/theme";
import {TrackSource} from "livekit-server-sdk";

const defaultListenedRoomEvents: RoomEvent[] = Object.values(RoomEvent);

type RoomTransformer = (room: Room, event?: RoomEvent) => unknown;

const roomListener = <T = Room>(room: Room, events: RoomEvent[] = defaultListenedRoomEvents, transform: RoomTransformer = (room) => room, initialValue?: T) =>
    readable<T>(initialValue || transform(room) as T, (set) => {
        const updater = (event: RoomEvent) => () => set(transform(room, event) as T);

        for (const event of events) {
            room.on(event, updater(event));
        }
    })


export const addReaction = (id: string | undefined, reaction: JamReaction, update: (fn: Updater<Record<string, JamReaction[]>>) => void) =>
{
    if(!id) {
        return;
    }
    update(reactions => {
        const oldList = reactions[id] || [];
        const newList = [reaction, ...oldList];
        return {...reactions, [id]: newList};
    });
    setTimeout(
        () => update(
            reactions => ({...reactions, [id]: reactions[id].filter(
                        r => r.id !== reaction.id)}
            )),
        5000
    )

}

const getReactions = (room: Room) =>
    writable<Record<string, JamReaction[]>>({}, (_, update) => {
        room.on(RoomEvent.DataReceived, (payload, participant) => {
            const receivedData = JSON.parse(new TextDecoder().decode(payload)) as JamMessage;
            if(receivedData.type === 'reaction') {
                addReaction(participant?.identity, receivedData, update);
            }
        })
    });




export const userInteracted = writable<boolean>(false);
export const enterOnce = writable<boolean>(false);


export const createParticipantContext = (jamRoom?: JamRoom) => (participant: Participant): ParticipantContext => {
    const tracks =
        [...participant.trackPublications.values()]
            .map((tp) => tp.track)
            .filter(Boolean) as Track<Track.Kind>[];

    const {state, info} = getMetadata(participant);

    const id = participant.identity;

    const microphoneTrack = getMicrophoneTrack(participant);
    const cameraTrack = getCameraTrack(participant);

    const microphoneEnabled = !!microphoneTrack;
    const microphoneMuted = !!microphoneTrack?.isMuted;

    return {
        id,
        participant,
        info,
        state,
        tracks,
        cameraTrack,
        microphoneTrack,
        microphoneEnabled,
        microphoneMuted,
        screenTrack: tracks.find(track =>
                    track.kind === Track.Kind.Video && track.source === Track.Source.ScreenShare
                ) as Track<Track.Kind.Video> | undefined,
        isSpeaking: participant.isSpeaking,
        roles: {
            speaker: !!jamRoom?.speakers.includes(id),
            moderator: !!jamRoom?.moderators.includes(id),
            presenter: !!jamRoom?.moderators.includes(id),
        }
    }
};

export const getParticipantContext = (participant: Participant, jamRoomStore: Readable<JamRoom | undefined>) => derived<Stores, ParticipantContext>(jamRoomStore, ($jamRoom, set) => {

    set(createParticipantContext($jamRoom)(participant));
    const listener = () => set(createParticipantContext($jamRoom)(participant));

    for(const e of Object.values(ParticipantEvent)) {
        // @ts-ignore
        participant.on(e, listener);
    }
    return () => {
        if(listener) {
            for (const e of Object.values(ParticipantEvent)) {
                // @ts-ignore
                participant.removeListener(e, listener);
            }
        }
    }
})

export const initializeRoomContext = (
    roomId: string,
    jamConfig: StaticConfig,
    jamRoom: JamRoom | undefined,
    dynamicConfig: DynamicConfig) => {

    if(getContext('room-context')) {
        throw new Error('Cannot reinitialize room context');
    }

    const livekitRoom = new Room(jamConfig.livekit.roomOptions);

    if(dynamicConfig.identity) {
        importRoomIdentity(roomId, {info: dynamicConfig.identity}).then();
    }

    livekitRoom.localParticipant.on('participantPermissionsChanged', async () => {
        const shouldHaveMicrophone = !!livekitRoom.localParticipant.permissions?.canPublishSources.includes(TrackSource.MICROPHONE);
        if(shouldHaveMicrophone) {
            await livekitRoom.localParticipant.setMicrophoneEnabled(true);
        } else {
            const trackPublication = livekitRoom.localParticipant.getTrackPublication(Track.Source.Microphone);
            if(trackPublication?.track) {
                await livekitRoom.localParticipant.unpublishTrack(trackPublication.track, true);
            }
        }


        const shouldHaveCamera = !!livekitRoom.localParticipant.permissions?.canPublishSources.includes(TrackSource.CAMERA);
        if(!shouldHaveCamera) {
            const trackPublication = livekitRoom.localParticipant.getTrackPublication(Track.Source.Camera);
            if(trackPublication?.track) {
                await livekitRoom.localParticipant.unpublishTrack(trackPublication.track, true);
            }
        }
    });

    const livekitRoomStore = roomListener(livekitRoom);
    const jamRoomStore = roomListener<JamRoom | undefined>(
        livekitRoom,
        [RoomEvent.RoomMetadataChanged, RoomEvent.Connected],
        toJamRoom,
        jamRoom
        );

    const reactions = getReactions(livekitRoom);

    const api = derived(
        [livekitRoomStore, identitiesStore, jamRoomStore],
        ([$room, $identities, $jamRoom]) =>
            createRoomApi(jamConfig, dynamicConfig, roomId, $room, $identities, $jamRoom, reactions));



    const context: RoomContext = {
        state: {
            roomId,
            dynamicConfig,
            livekitRoom: livekitRoomStore,
            jamRoom: jamRoomStore,
            colors: derived(jamRoomStore, ($jamRoom) => colors($jamRoom)),
            reactions: readonly(reactions),
        },
        api,

    };

    return setContext<RoomContext>('room-context', context);
}

export const getRoomContext = () => getContext<RoomContext>('room-context');

export const initializeActionsContext = () => setContext('actions', {
    showActions: writable<boolean>(false),
    showRoleActions: writable<string | undefined>(undefined),
    showDeviceActions: writable<boolean>(false),
});

export const getActionsContext = () => getContext<ActionsContext>('actions');
