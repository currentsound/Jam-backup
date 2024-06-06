import {AccessToken, type ParticipantInfo, RoomServiceClient, TrackSource} from "livekit-server-sdk";
import {livekitKey, livekitSecret, livekitUrl} from "$lib/server/config";
import type {IdentityInfo, JamRoom} from "$lib/types";
import {hasAccessToRoom, isModerator} from "../authz";
import {asyncFilter} from "$lib/utils";
import {identityAccessor} from "$lib/server/handlers/identity";
import {accessor} from "$lib/server/handlers/helpers";

export const roomServiceClient = new RoomServiceClient(livekitUrl, livekitKey, livekitSecret);


const publishableSources = (room: JamRoom, identity: IdentityInfo) => {
    const sources: TrackSource[] = [];
    if(room.speakers.includes(identity.id) || room.stageOnly) {
        sources.push(TrackSource.MICROPHONE);
    }
    if(room.presenters.includes(identity.id) || room.videoCall || room.videoEnabled) {
        sources.push(TrackSource.CAMERA);
    }
    if(room.presenters.includes(identity.id)) {
        sources.push(TrackSource.SCREEN_SHARE, TrackSource.SCREEN_SHARE_AUDIO);
    }

    return sources;
}

const createGrant = (room: JamRoom, info: IdentityInfo) => ({
    roomJoin: hasAccessToRoom(room, info), room: room.id,
    roomAdmin: isModerator(room, info),
    canSubscribe: true,
    canPublishData: true,
    canPublish: true,
    canPublishSources: publishableSources(room, info),
    canUpdateOwnMetadata: true,

})

const updateGrantIfNecessary = async (participant: ParticipantInfo, oldRoom: JamRoom, newRoom: JamRoom) => {
    const oldGrant = createGrant(oldRoom, {id: participant.identity});

    const newGrant = createGrant(newRoom, {id: participant.identity});

    if(
        !(
            oldGrant.roomJoin === newGrant.roomJoin
            &&
            oldGrant.roomAdmin === newGrant.roomAdmin
            &&
            oldGrant.canPublishSources.join('-') === newGrant.canPublishSources.join('-') // really compare sets

        )
    ) {
        await roomServiceClient.updateParticipant(
                    newRoom.id,
                    participant.identity,
                    participant.metadata,
                    newGrant);
    }


}

export const createOrUpdateRoom = async (room: JamRoom) => {
    const metadata = JSON.stringify(room);
    const existingRoom = await roomServiceClient.listRooms([room.id]).then(rooms => rooms[0]);

    const oldJamRoom: JamRoom | undefined = (existingRoom?.metadata && (JSON.parse(existingRoom.metadata) as JamRoom)) || room;

    if(existingRoom && existingRoom.metadata !== metadata) {
        await roomServiceClient.updateRoomMetadata(room.id, metadata);
    } else {
        await roomServiceClient.createRoom({
            name: room.id,
            metadata,
        });
    }
    roomServiceClient
        .listParticipants(room.id)
        .then(ps =>
            ps.forEach(p => updateGrantIfNecessary(p, oldJamRoom, room)));
}

export const createAccessToken = (room: JamRoom, info: IdentityInfo) => {
    const at = new AccessToken(livekitKey, livekitSecret, {
        identity: info.id,
        name: info.name,
        metadata: JSON.stringify({info, state: {handRaised: false}}) ,
    });
    at.addGrant(createGrant(room, info));
    return at.toJwt();
}

export const activeUserCount = () =>
    roomServiceClient.listRooms()
        .then(rooms => asyncFilter(rooms, async room => Boolean(await accessor<JamRoom>({prefix: 'rooms'}).get(room.name))))
        .then(rooms => Promise.all(rooms.map(room => roomServiceClient.listParticipants(room.name).then(participants => participants.map(p => p.identity)))))
        .then(roomParticipants => roomParticipants.flat())
        .then(participantIds => Promise.all(participantIds.map(id => identityAccessor.get(id))))
        .then(identities => identities.filter(Boolean)) as Promise<IdentityInfo[]>;
