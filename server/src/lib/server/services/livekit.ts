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

export const createAccessToken = (room: JamRoom, identity: IdentityInfo) => {
    const at = new AccessToken(livekitKey, livekitSecret, {
        identity: identity.id,
        name: identity.name,
        metadata: JSON.stringify(identity),
    });
    at.addGrant({
        roomJoin: hasAccessToRoom(room, identity), room: room.id,
        roomAdmin: isModerator(room, identity),
        canSubscribe: true,
        canPublishData: true,
        canPublishSources: publishableSources(room, identity),
    });
    return at.toJwt();
}

export const activeUserCount = () =>
    roomServiceClient.listRooms()
        .then(rooms => asyncFilter(rooms, async room => Boolean(await roomAccessor.get(room.name))))
        .then(rooms => Promise.all(rooms.map(room => roomServiceClient.listParticipants(room.name).then(participants => participants.map(p => p.identity)))))
        .then(roomParticipants => roomParticipants.flat())
        .then(participantIds => Promise.all(participantIds.map(id => identityAccessor.get(id))))
        .then(identities => identities.filter(Boolean)) as Promise<IdentityInfo[]>;
