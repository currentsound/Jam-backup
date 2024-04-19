import {AccessToken, RoomServiceClient, TrackSource} from "livekit-server-sdk";
import {livekitKey, livekitSecret, livekitUrl} from "$lib/server/config";
import type {IdentityInfo, JamRoom} from "$lib/types";
import {hasAccessToRoom, isModerator} from "../authz";
import {roomAccessor} from "$lib/server/handlers/room";
import {asyncFilter} from "$lib/utils";
import {identityAccessor} from "$lib/server/handlers/identity";

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
    canPublishSources: publishableSources(room, info),
    canUpdateOwnMetadata: true,

})

export const createOrUpdateRoom = async (room: JamRoom) => {
    const metadata = JSON.stringify(room);
    const existingRoom = await roomServiceClient.listRooms([room.id]).then(rooms => rooms[0]);
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
            ps.forEach(p =>
                roomServiceClient.updateParticipant(
                    room.id,
                    p.identity,
                    p.metadata,
                    createGrant(room, {id: p.identity}))));
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
        .then(rooms => asyncFilter(rooms, async room => Boolean(await roomAccessor.get(room.name))))
        .then(rooms => Promise.all(rooms.map(room => roomServiceClient.listParticipants(room.name).then(participants => participants.map(p => p.identity)))))
        .then(roomParticipants => roomParticipants.flat())
        .then(participantIds => Promise.all(participantIds.map(id => identityAccessor.get(id))))
        .then(identities => identities.filter(Boolean)) as Promise<IdentityInfo[]>;
