import {
    type DynamicConfig,
    type IdentityInfo,
    type JamAccess, type JamReaction,
    type JamRoom, type ParticipantMetadata, participantMetadataSchema, type ParticipantState,
    type RoomAPI, type ServerAPI,
    type StaticConfig
} from "$lib/types";
import {LocalTrack, type Room} from "livekit-client";
import {defaultIdentity, identityForRoom, importRoomIdentity, updateIdentity} from "$lib/client/stores/identity";
import {getMicrophoneTrack, sendJamMessage} from "$lib/client/utils/livekit";
import * as backend from "$lib/client/backend";
import {displayName} from "$lib/client/utils/avatar";
import {uuidv7} from "uuidv7";
import {switchToNextCamera} from "$lib/client/utils/media";
import {addAdmin, isAdmin, removeAdmin} from "$lib/client/utils/admin";
import {pof} from "$lib/utils";
import type {Writable} from "svelte/store";
import {addReaction} from "$lib/client/stores/room";




export const createRoomApi = (staticConfig: StaticConfig, dynamicConfig: DynamicConfig, roomId: string, room: Room, jamRoom: JamRoom | undefined, reactions: Writable<Record<string, JamReaction[]>>): RoomAPI => {

    const identity = () => identityForRoom(roomId);

    type roomUpdater = (room: JamRoom) => JamRoom
    const updateRoom = async (updater: roomUpdater = room => room) => !!jamRoom && backend.updateRoom(identity(), roomId, updater(jamRoom));

    const setMetadata = (metadata: ParticipantMetadata) => room.localParticipant.setMetadata(JSON.stringify(metadata));
    const getMetadata = () => pof<ParticipantMetadata, ParticipantMetadata>(
        participantMetadataSchema,
        JSON.parse(room.localParticipant.metadata || '{}'),
        {
            info: identity().info,
            state: {
                handRaised: false,
            }
        })

    const importRoomIdentityIfNeeded = () =>
        dynamicConfig.identity ?
            importRoomIdentity(roomId, {info: dynamicConfig.identity})
            :
            Promise.resolve(true);


    return {
        createRoom: (roomId: string, partialRoom?: Partial<JamRoom>) =>
            importRoomIdentityIfNeeded()
                .then(() => identityForRoom(roomId))
                .then(() => backend.createRoom(
                identity(),
                roomId,
                {
                    ...staticConfig.defaultRoom,
                    ...dynamicConfig.room,
                    ...partialRoom,
                    id: roomId
                })),
        updateRoom: (room: JamRoom) => updateRoom(() => room),
        getDisplayName: (info: IdentityInfo) => displayName(info, jamRoom),
        addSpeaker: (participantId: string) => updateRoom((room) => ({...room, speakers: [...room.speakers, participantId]})),
        addModerator: (participantId: string) => updateRoom((room) => ({...room, moderators: [...room.moderators, participantId]})),
        addPresenter: (participantId: string) => updateRoom((room) => ({...room, presenters: [...room.presenters, participantId]})),
        removeSpeaker: (participantId: string) => updateRoom((room) => ({...room, speakers: room.speakers.filter(id => id != participantId)})),
        removeModerator: (participantId: string) => updateRoom((room) => ({...room, moderators: room.moderators.filter(id => id != participantId)})),
        removePresenter: (participantId: string) => updateRoom((room) => ({...room, presenters: room.presenters.filter(id => id != participantId)})),
        updateInfo: (info: IdentityInfo) => {
            const newIdentity = identity();
            newIdentity.info = info;
            setMetadata({...getMetadata(), info})
            return updateIdentity(roomId, newIdentity);
        },
        updateState: (stateUpdate: Partial<ParticipantState>) => {
            const {info, state} = getMetadata();
            setMetadata({info , state: {...state, ...stateUpdate}});
        },
        enterRoom: () => importRoomIdentityIfNeeded().then(() => backend
            .getToken(identity(), roomId)
            .then((result: JamAccess | undefined) => result && room.connect(result.livekitUrl, result.token, {}))
            .then(() => setMetadata({info: identity().info, state: {handRaised: false}}))),
        leaveRoom: () => room.disconnect(),
        leaveStage: () => backend.deleteRequest(identity(), `/rooms/${roomId}/speakers/${identity().publicKey}`),
        sendReaction: (reaction: string) => {
            const reactionObject: JamReaction = {id: uuidv7(), type: 'reaction', reaction};
            addReaction(identity().publicKey, reactionObject, reactions.update);
            return sendJamMessage(room, reactionObject);
        },
        autoJoinOnce: () => {},
        switchCamera: () => switchToNextCamera(room),
        setCameraOn: (cameraOn: boolean) => room.localParticipant.setCameraEnabled(cameraOn),
        toggleMicrophone: async () => {
            const track = (getMicrophoneTrack(room.localParticipant) as LocalTrack);
            if(track.isMuted) {
                await track.unmute();
            } else {
                await track.mute();
            }
        },
        toggleCamera: () => room.localParticipant.setCameraEnabled(!room.localParticipant.isCameraEnabled),
        selectMicrophone: (mic: InputDeviceInfo) => room.switchActiveDevice("audioinput", mic.deviceId),
        startScreenShare: () => room.localParticipant.setScreenShareEnabled(true),
        stopScreenShare: () => room.localParticipant.setScreenShareEnabled(false),
        startRecording: () => {},
        stopRecording: () => {},
        downloadRecording: () => {},
        startPodcastRecording: () => {},
        stopPodcastRecording: () => {},
    };
}

export const createServerApi = (): ServerAPI => {

        return {
            getRoom: (roomId: string) => backend.getRoom(roomId),
            isAdmin: (participantId: string) => isAdmin(defaultIdentity(), participantId),
            addAdmin: (participantId: string) => addAdmin(defaultIdentity(), participantId),
            removeAdmin: (participantId: string) => removeAdmin(defaultIdentity(), participantId),
        };
}
