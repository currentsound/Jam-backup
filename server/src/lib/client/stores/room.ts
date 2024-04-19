import {Participant, ParticipantEvent, RemoteParticipant, Room, RoomEvent, Track} from "livekit-client";
import {derived, type Readable, readable, readonly, type Stores, type Updater, writable} from "svelte/store";
import {getContext, setContext} from "svelte";
import {
    type ActionsContext,
    type JamMessage,
    type JamReaction,
    type JamRoom,
    type ParticipantContext,
    type RoomContext,
    type StaticConfig
} from "$lib/types";
import {createRoomApi} from "$lib/client/api";
import {getMetadata, getMicrophoneTrack, toJamRoom} from "$lib/client/utils/livekit";
import {identitiesStore} from "$lib/client/stores/identity";
import {colors} from "$lib/client/utils/theme";

const defaultListenedRoomEvents: RoomEvent[] = Object.values(RoomEvent);

type RoomTransformer = (room: Room) => unknown;

const roomListener = <T = Room>(room: Room, events: RoomEvent[] = defaultListenedRoomEvents, transform: RoomTransformer = (room) => room, initialValue?: T) =>
    readable<T>(initialValue || transform(room) as T, (set) => {
        const updater = () => set(transform(room) as T);

        for (const event of events) {
            room.on(event, updater);
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


const participantContext = (jamRoom?: JamRoom) => (participant: Participant): ParticipantContext => {
    const tracks =
        [...participant.trackPublications.values()]
            .map((tp) => tp.track)
            .filter(Boolean) as Track<Track.Kind>[];

    const {state, info} = getMetadata(participant);

    const id = participant.identity;

    const microphoneTrack = getMicrophoneTrack(participant);

    const microphoneEnabled = !!microphoneTrack;
    const microphoneMuted = !!microphoneTrack?.isMuted;

    return {
        id,
        participant,
        info,
        state,
        tracks,
        cameraTrack: tracks.find(track =>
                    track.kind === Track.Kind.Video && track.source === Track.Source.Camera
                ) as Track<Track.Kind.Video> | undefined,
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

    set(participantContext($jamRoom)(participant));
    const listener = () => set(participantContext($jamRoom)(participant));

    for(const e of Object.values(ParticipantEvent)) {
        // @ts-ignore
        participant.on(e, listener);
    }
    return () => {
        for(const e of Object.values(ParticipantEvent)) {
            // @ts-ignore
            participant.removeListener(e, listener);
        }
    }
})

export const getParticipants = (room: Room) => {
    return readable<RemoteParticipant[]>(
        [...room.remoteParticipants.values()],
        (set) => {
            const listener = () =>
                set([...room.remoteParticipants.values()]);
            room.on(RoomEvent.ParticipantConnected, listener);
            room.on(RoomEvent.ParticipantDisconnected, listener);
            return () => {
                room.removeListener(RoomEvent.ParticipantConnected, listener);
                room.removeListener(RoomEvent.ParticipantDisconnected, listener);
            };
        },
    );
};



export const initializeRoomContext = (roomId: string, jamConfig: StaticConfig, jamRoom: JamRoom | undefined) => {

    const livekitRoom = new Room(jamConfig.livekit.roomOptions);

    if(getContext('room-context')) {
        throw new Error('Cannot reinitialize room context');
    }

    const livekitRoomStore = roomListener(livekitRoom);
    const jamRoomStore = roomListener<JamRoom | undefined>(
        livekitRoom,
        [RoomEvent.RoomMetadataChanged],
        toJamRoom,
        jamRoom
        );

    livekitRoomStore.subscribe(console.log);

    const reactions = getReactions(livekitRoom);

    const api = derived(
        [livekitRoomStore, identitiesStore, jamRoomStore],
        ([$room, $identities, $jamRoom]) =>
            createRoomApi(roomId, $room, $identities, $jamRoom, reactions));


    const me = derived(
        [livekitRoomStore, jamRoomStore],
        ([$room, $jamRoom]) => ({
            ...participantContext($jamRoom)($room.localParticipant),
            hasMicFailed: !!$room.localParticipant.lastMicrophoneError
        })
    );

    const context: RoomContext = {
        state: {
            roomId,
            livekitRoom: livekitRoomStore,
            jamRoom: jamRoomStore,
            colors: derived(jamRoomStore, ($jamRoom) => colors($jamRoom)),
            me,
            reactions: readonly(reactions),
        },
        api,

    };

    return setContext<RoomContext>('room-context', context);
}

export const getRoomContext = () => getContext<RoomContext>('room-context');

export const initializeActionsContext = () => setContext('actions', {
    showActions: writable<boolean>(false),
    showRoleActions: writable<string | undefined>(undefined)
});

export const getActionsContext = () => getContext<ActionsContext>('actions');
