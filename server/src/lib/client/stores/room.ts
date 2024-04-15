import {Participant, ParticipantEvent, RemoteParticipant, Room, RoomEvent, Track} from "livekit-client";
import {derived, readable, type Updater, writable} from "svelte/store";
import {getContext, setContext} from "svelte";
import {
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
import {toJamRoom} from "$lib/client/utils/livekit";
import {identitiesStore} from "$lib/client/stores/identity";

const defaultListenedRoomEvents: RoomEvent[] = [
    RoomEvent.Disconnected,
    RoomEvent.ParticipantConnected,
    RoomEvent.ConnectionStateChanged,
    RoomEvent.RoomMetadataChanged,
];




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
    ParticipantEvent.TrackSubscribed
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


export const getParticipantInfo = (participant: Participant) => participantListener<IdentityInfo>(participant, [ParticipantEvent.ParticipantMetadataChanged], (participant) => {
    const parseResult = participantMetadataSchema.safeParse(JSON.parse(participant?.metadata || '{}'));
    if(parseResult.success) {
        return parseResult.data.identity;
    } else {
        return {id: participant.identity};
    }
})

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

const participantContext = (participant: Participant): ParticipantContext => ({
    livekitParticipant: participantListener(participant),
    info: getParticipantInfo(participant),
    state: getParticipantState(participant),
    tracks: getParticipantTracks(participant),
    isSpeaking: getIsParticipantSpeaking(participant),
    reactions: getParticipantReactions(participant),
});

export const initializeRoomContext = (roomId: string, jamConfig: StaticConfig, jamRoom: JamRoom | undefined) => {

    const livekitRoom = new Room(jamConfig.livekit.roomOptions);

    if(getContext('room-context')) {
        throw new Error('Cannot reinitialize room context');
    }

    const livekitRoomStore = roomListener(livekitRoom);
    const jamRoomStore = roomListener<JamRoom | undefined>(
        livekitRoom,
        [RoomEvent.RoomMetadataChanged, RoomEvent.ConnectionStateChanged],
        toJamRoom,
        jamRoom
        );

    const api = derived(
        [livekitRoomStore, identitiesStore, jamRoomStore],
        ([$room, $identities, $jamRoom]) =>
            createRoomApi(roomId, $room, $identities, $jamRoom, jamConfig));


    const context: RoomContext = {
        state: {
            roomId,
            livekitRoom: livekitRoomStore,
            jamRoom: jamRoomStore,
            participants: roomListener<ParticipantContext[]>(
                livekitRoom,
                [
                    RoomEvent.ParticipantConnected,
                    RoomEvent.ParticipantDisconnected,
                ],
                (room) =>
                    [
                        room.localParticipant,
                        ...(Object.values(room.remoteParticipants) as RemoteParticipant[])
                    ].map(participantContext)),
        },
        api,

    };

    return setContext<RoomContext>('room-context', context);
}

export const getRoomContext = () => getContext<RoomContext>('room-context');
