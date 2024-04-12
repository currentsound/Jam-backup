import {LocalParticipant, Participant, ParticipantEvent, type Room, RoomEvent, Track} from "livekit-client";
import {readable, type Updater} from "svelte/store";
import {getContext, setContext} from "svelte";
import {
    type IdentityInfo,
    type JamMessage,
    type JamReaction,
    type JamRoom,
    jamRoomSchema, participantMetadataSchema, type ParticipantState
} from "$lib/types";

const defaultListenedRoomEvents: RoomEvent[] = [
    RoomEvent.Disconnected,
    RoomEvent.ParticipantConnected,
    RoomEvent.ConnectionStateChanged,
    RoomEvent.RoomMetadataChanged,
];


export const setLivekitRoomContext = (room: Room) => setContext('livekit-room', room);
export const getLivekitRoomContext = () => getContext<Room>('livekit-room')

type RoomTransformer = (room: Room) => unknown;

const roomListener = <T = Room>(room: Room, events: RoomEvent[] = defaultListenedRoomEvents, transform: RoomTransformer = (room) => room) =>
    readable<T>(transform(room) as T, (set) => {
        const updater = () => set(transform(room) as T);

        for (const event of events) {
            room.on(event, updater);
        }
    })

export const getRoom = () => roomListener(getLivekitRoomContext());

export const getJamRoom = () => roomListener<JamRoom>(getLivekitRoomContext(), [RoomEvent.RoomMetadataChanged], room =>
    jamRoomSchema.parse(JSON.parse(room.metadata ?? '{}')));

const defaultListenedParticipantEvents: ParticipantEvent[] = [
    ParticipantEvent.ParticipantMetadataChanged,
    ParticipantEvent.ParticipantPermissionsChanged,
    ParticipantEvent.TrackSubscribed,
    ParticipantEvent.TrackUnsubscribed,
    ParticipantEvent.DataReceived
];

type ParticipantTransformer = (participant?: Participant) => unknown;

const participantListener = <T = Participant>(participantId: string, events: ParticipantEvent[] = defaultListenedParticipantEvents, transform: ParticipantTransformer = (participant) => participant) => {
    const participant = getLivekitRoomContext().getParticipantByIdentity(participantId);

    return readable<T>(transform(participant) as T, (set) => {
        const updater = () => set(transform(participant) as T);

        for (const event of events) {
            // @ts-expect-error Typing Error in livekit client api
            participant.on(event, updater);
        }
    })
}

const participantEventListener = <T>(
    participantId: string,
    initialState: T,
    event: ParticipantEvent,
    handler: (set: ((value: T) => void), update: ((fn: Updater<T>) => void), ...eventArgs: unknown[]) => void) =>
{
    const participant = getLivekitRoomContext().getParticipantByIdentity(participantId);

    return readable<T>(initialState, (set, update) => {
        if(participant) {
            // @ts-expect-error Typing Error in livekit client api
            participant.on(event, (...args) => handler(set, update, args));
        }
    })
}


export const getParticipant = (participantId: string) => participantListener(participantId);

const participantStreamsEvents = [
    ParticipantEvent.TrackUnsubscribed,
    ParticipantEvent.TrackSubscribed
]

export const getParticipantTracks = (participantId: string) => participantListener<Track[]>(participantId, participantStreamsEvents, (participant): Track<Track.Kind>[] =>
    participant ? [...participant.trackPublications.values()].map((tp) => tp.track).filter(Boolean) as Track<Track.Kind>[] : []);


const participantSpeakingEvents = [ParticipantEvent.IsSpeakingChanged];

export const getIsParticipantSpeaking = (participantId: string) => participantListener<boolean>(participantId, participantSpeakingEvents,
    (participant) => !!participant?.isSpeaking);


export const getCameraTrack = (tracks: Track[]) => tracks.filter(
    (t) => t.kind === Track.Kind.Video && t.source === Track.Source.Camera,
)[0];

export const getParticipantReactions = (participantId: string) => participantEventListener<JamReaction[]>(
    participantId, [], ParticipantEvent.DataReceived, (_, update, ...args) => {
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

export const getMe = () => participantListener<LocalParticipant>(getLivekitRoomContext().localParticipant.identity);

export const getParticipantInfo = (participantId: string) => participantListener<IdentityInfo>(participantId, [ParticipantEvent.ParticipantMetadataChanged], (participant) => {
    const parseResult = participantMetadataSchema.safeParse(JSON.parse(participant?.metadata || '{}'));
    if(parseResult.success) {
        return parseResult.data.identity;
    } else {
        return {id: participantId};
    }
}

)

export const getParticipantState = (participantId: string) => participantListener<ParticipantState>(participantId, [ParticipantEvent.ParticipantMetadataChanged], (participant) => {
        const parseResult = participantMetadataSchema.safeParse(JSON.parse(participant?.metadata || '{}'));
        if(parseResult.success) {
            return parseResult.data.state;
        } else {
            return {id: participantId};
        }
    }
)

export const getMyInfo = () => getParticipantInfo(getLivekitRoomContext().localParticipant.identity);
export const getMyState = () => getParticipantInfo(getLivekitRoomContext().localParticipant.identity);
