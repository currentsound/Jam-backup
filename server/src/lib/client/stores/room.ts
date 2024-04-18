import {Participant, ParticipantEvent, RemoteParticipant, Room, RoomEvent, Track} from "livekit-client";
import {derived, type Readable, readable, type Stores, type Updater, writable} from "svelte/store";
import {getContext, setContext} from "svelte";
import {
    type ActionsContext,
    type IdentityInfo,
    type JamMessage,
    type JamReaction,
    type JamRoom,
    type ParticipantContext,
    participantMetadataSchema,
    type ParticipantState,
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


const defaultListenedParticipantEvents: ParticipantEvent[] = [
    ParticipantEvent.ParticipantMetadataChanged,
    ParticipantEvent.ParticipantPermissionsChanged,
    ParticipantEvent.TrackSubscribed,
    ParticipantEvent.TrackUnsubscribed,
    ParticipantEvent.DataReceived
];


type ParticipantTransformer = (participant: Participant) => unknown;

const participantListener = <T = Participant>(participant: Participant, events: ParticipantEvent[] = defaultListenedParticipantEvents, transform: ParticipantTransformer = (participant) => participant) => {

    return readable<T>(transform(participant) as T, (set) => {
        const updater = () => set(transform(participant) as T);

        for (const event of events) {
            // @ts-expect-error Typing Error in livekit client api
            participant.on(event, updater);
        }
    })
}

const participantEventListener = <T>(
    participant: Participant,
    initialState: T,
    event: ParticipantEvent,
    handler: (set: ((value: T) => void), update: ((fn: Updater<T>) => void), ...eventArgs: unknown[]) => void) =>
{

    return readable<T>(initialState, (set, update) => {
        if(participant) {
            // @ts-expect-error Typing Error in livekit client api
            participant.on(event, (...args) => handler(set, update, args));
        }
    })
}



const participantStreamsEvents = [
    ParticipantEvent.TrackUnsubscribed,
    ParticipantEvent.TrackSubscribed,
    ParticipantEvent.TrackPublished,
    ParticipantEvent.TrackUnpublished
]

const getParticipantTracks = (participant: Participant) => participantListener<Track[]>(participant, participantStreamsEvents, (participant): Track<Track.Kind>[] =>
    participant ? [...participant.trackPublications.values()].map((tp) => tp.track).filter(Boolean) as Track<Track.Kind>[] : []);


const participantSpeakingEvents = [ParticipantEvent.IsSpeakingChanged];

export const getIsParticipantSpeaking = (participant: Participant) => participantListener<boolean>(participant, participantSpeakingEvents,
    (participant) => !!participant?.isSpeaking);


export const getCameraTrack = (tracks: Track[]) => tracks.filter(
    (t) => t.kind === Track.Kind.Video && t.source === Track.Source.Camera,
)[0];

export const getParticipantReactions = (participant: Participant) => participantEventListener<JamReaction[]>(
    participant, [], ParticipantEvent.DataReceived, (_, update, ...args) => {
        const [data]  = args as [Uint8Array, [...unknown[]]];
        const receivedData = JSON.parse(new TextDecoder().decode(data)) as JamMessage;
        if(receivedData.type === 'reaction') {
            update(reactions => [receivedData, ...reactions]);
            setTimeout(
                () => update(
                    reactions => reactions.filter(
                        r => r.id !== receivedData.id)
                ),
                5000
            )
        }
    })

export const getReactions = (room: Room) =>
    readable<Record<string, JamReaction[]>>({}, (set, update) => {
        room.on(RoomEvent.DataReceived, (payload, participant, kind) => {
            const receivedData = JSON.parse(new TextDecoder().decode(payload)) as JamMessage;
            if(receivedData.type === 'reaction') {
                const id = participant?.identity;
                if(!id) {
                    return;
                }
                update(reactions => {
                    const oldList = reactions[participant.identity] || [];
                    const newList = [receivedData, ...oldList];
                    return {...reactions, [id]: newList};
                });
                setTimeout(
                    () => update(
                        reactions => ({...reactions, [id]: reactions[id].filter(
                            r => r.id !== receivedData.id)}
                    )),
                    5000
                )
            }
        })
    });



export const getParticipantState = (participant: Participant) => participantListener<ParticipantState>(participant, [ParticipantEvent.ParticipantMetadataChanged], (participant) => {
        const parseResult = participantMetadataSchema.safeParse(JSON.parse(participant.metadata || '{}'));
        if(parseResult.success) {
            return parseResult.data.state;
        } else {
            return {id: participant};
        }
    }
)

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
            participant.removeListener(listener);
        }
    }
})



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
            createRoomApi(roomId, $room, $identities, $jamRoom, jamConfig));


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
            participants: derived(
                [livekitRoomStore, jamRoomStore],
                ([$livekitRoom, $jamRoom]) =>
                    [
                        ...(Object.values($livekitRoom.remoteParticipants) as RemoteParticipant[])
                    ]),
            reactions,
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
