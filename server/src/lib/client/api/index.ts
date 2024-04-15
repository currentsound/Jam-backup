import {
    type DynamicConfig,
    type Identities,
    type IdentityInfo,
    type IdentityWithKeys,
    type JamRoom,
    type RoomAPI, type ServerAPI,
    type StaticConfig
} from "$lib/types";
import type {Room} from "livekit-client";
import {updateIdentity} from "$lib/client/stores/identity";
import {sendJamMessage} from "$lib/client/utils/livekit";
import * as backend from "$lib/client/backend";
import {displayName} from "$lib/client/utils/avatar";
import {uuidv7} from "uuidv7";
import {switchToNextCamera} from "$lib/client/utils/media";
import {addAdmin, removeAdmin} from "$lib/client/utils/admin";



export const createRoomApi = (room: Room, identities: Identities, jamRoom: JamRoom | undefined, jamConfig: StaticConfig): RoomAPI => {

    const roomId = room.name;
    const identity = identities[roomId] ?? identities._default;

    type roomUpdater = (room: JamRoom) => JamRoom
    const updateRoom = async (updater: roomUpdater = room => room) => !!jamRoom && backend.updateRoom(identity, roomId, updater(jamRoom));


    return {
        updateRoom: (room: JamRoom) => updateRoom(() => room),
        getDisplayName: (info: IdentityInfo) => displayName(info, jamRoom),
        addSpeaker: (participantId: string) => updateRoom((room) => ({...room, speakers: [...room.speakers, participantId]})),
        addModerator: (participantId: string) => updateRoom((room) => ({...room, moderators: [...room.moderators, participantId]})),
        addPresenter: (participantId: string) => updateRoom((room) => ({...room, presenters: [...room.presenters, participantId]})),
        removeSpeaker: (participantId: string) => updateRoom((room) => ({...room, speakers: room.speakers.filter(id => id != participantId)})),
        removeModerator: (participantId: string) => updateRoom((room) => ({...room, moderators: room.moderators.filter(id => id != participantId)})),
        removePresenter: (participantId: string) => updateRoom((room) => ({...room, presenters: room.presenters.filter(id => id != participantId)})),
        updateInfo: (info: IdentityInfo) => {
            identity.info = info;
            updateIdentity(roomId, identity);
            return backend.putOrPost(
                identity,
                `/identities/${identity.publicKey}`,
                info
            )
        },
        enterRoom: async () => room.connect(jamConfig.livekit.url, await backend.getToken(identity, roomId)),
        leaveRoom: () => room.disconnect(),
        leaveStage: () => backend.deleteRequest(identity, `/rooms/${roomId}/speakers/${identity.publicKey}`),
        sendReaction: (reaction: string) => sendJamMessage(room, {id: uuidv7(), type: 'reaction', reaction}),
        autoJoinOnce: () => {},
        switchCamera: () => switchToNextCamera(room),
        setCameraOn: (cameraOn: boolean) => room.localParticipant.setCameraEnabled(cameraOn),
        selectMicrophone: (mic: InputDeviceInfo) => room.switchActiveDevice("audioinput", mic.deviceId),
        startScreenShare: () => room.localParticipant.setScreenShareEnabled(true),
        stopScreenShare: () => room.localParticipant.setScreenShareEnabled(false),
        startServerRecording: () => {},
        stopServerRecording: () => {},
        startPodcastRecording: () => {},
        stopPodcastRecording: () => {},
    };
}

export const createServerApi = (identities: Identities, dynamicConfig: DynamicConfig, jamConfig: StaticConfig): ServerAPI => {
        const identity = identities._default;

        return {
            createRoom: (roomId: string, partialRoom?: Partial<JamRoom>) =>
                backend.createRoom(
                    identity,
                    roomId,
                    {
                        ...jamConfig.defaultRoom,
                        ...dynamicConfig.room,
                        ...partialRoom,
                        id: roomId
                    }),
            getRoom: (roomId: string) => backend.getRoom(roomId),
            addAdmin: (participantId: string) => addAdmin(identity, participantId),
            removeAdmin: (participantId: string) => removeAdmin(identity, participantId),
        };
}
