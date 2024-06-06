import {type Participant, type Room, Track} from "livekit-client";
import {pof, pou} from "$lib/utils";
import {
    type JamMessage,
    type JamRoom,
    jamRoomSchema,
    type ParticipantMetadata,
    participantMetadataSchema
} from "$lib/types";

export const toJamRoom = (room: Room) => pou<JamRoom>(
    jamRoomSchema,
    JSON.parse(room.metadata || '{}')
);

export const sendJamMessage = async (room: Room, message: JamMessage) => {

    await room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(message)), {
        destinationIdentities: message.destinationIdentities,
    });
}


export const getMicrophoneTrack = (participant: Participant) =>
    participant
        .getTrackPublications()
        .map(tp => tp.track)
        .find(track =>
            track && track.kind === Track.Kind.Audio && track.source === Track.Source.Microphone
        ) as Track<Track.Kind.Audio> | undefined

export const getCameraTrack = (participant: Participant) =>
    participant
        .getTrackPublications()
        .map(tp => tp.track)
        .find(track =>
            track && track.kind === Track.Kind.Video && track.source === Track.Source.Camera
        ) as Track<Track.Kind.Video> | undefined


export const getMetadata = (participant: Participant) => pof<ParticipantMetadata, ParticipantMetadata>(
    participantMetadataSchema,
    JSON.parse(participant.metadata || '{}'),
    {
        info: {id: participant.identity, name: 'XXX'},
        state: {
            handRaised: false,
        }
    })
