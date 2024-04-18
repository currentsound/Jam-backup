import {
    type DynamicConfig,
    type Identities,
    type IdentityInfo,
    type JamAccess,
    type JamRoom, type ParticipantMetadata, participantMetadataSchema, type ParticipantState,
    type RoomAPI, type ServerAPI,
    type StaticConfig
} from "$lib/types";
import {LocalTrack, type Room} from "livekit-client";
import {updateIdentity} from "$lib/client/stores/identity";
import {getMicrophoneTrack, sendJamMessage} from "$lib/client/utils/livekit";
import * as backend from "$lib/client/backend";
import {displayName} from "$lib/client/utils/avatar";
import {uuidv7} from "uuidv7";
import {switchToNextCamera} from "$lib/client/utils/media";
import {addAdmin, isAdmin, removeAdmin} from "$lib/client/utils/admin";
import {pof} from "$lib/utils";



export const createRoomApi = (roomId: string, room: Room, identities: Identities, jamRoom: JamRoom | undefined, jamConfig: StaticConfig): RoomAPI => {

    const identity = identities[roomId] ?? identities._default;

    type roomUpdater = (room: JamRoom) => JamRoom
    const updateRoom = async (updater: roomUpdater = room => room) => !!jamRoom && backend.updateRoom(identity, roomId, updater(jamRoom));

    const setMetadata = (metadata: ParticipantMetadata) => room.localParticipant.setMetadata(JSON.stringify(metadata));
    const getMetadata = () => pof<ParticipantMetadata, ParticipantMetadata>(
        participantMetadataSchema,
        JSON.parse(room.localParticipant.metadata || '{}'),
        {
            info: identity.info,
            state: {
                handRaised: false,
            }
        })


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
            setMetadata({...getMetadata(), info})
            return updateIdentity(roomId, identity);
        },
        updateState: (stateUpdate: Partial<ParticipantState>) => {
            const {info, state} = getMetadata();
            setMetadata({info , state: {...state, ...stateUpdate}});
        },
        enterRoom: () => backend
            .getToken(identity, roomId)
            .then((result: JamAccess | undefined) => result && room.connect(result.livekitUrl, result.token))
            .then(() => setMetadata({info: identity.info, state: {handRaised: false}}))
            .then(async () => {
                if(jamRoom?.speakers.includes(identity.publicKey)) {
                    await room.localParticipant.setMicrophoneEnabled(true);
                    console.log(room.localParticipant.isMicrophoneEnabled);
                }
            }),
        leaveRoom: () => room.disconnect(),
        leaveStage: () => backend.deleteRequest(identity, `/rooms/${roomId}/speakers/${identity.publicKey}`),
        sendReaction: (reaction: string) => sendJamMessage(room, {id: uuidv7(), type: 'reaction', reaction}),
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
        toggleCamera: () => room.localParticipant.setCameraEnabled(room.localParticipant.isCameraEnabled),
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
            isAdmin: (participantId: string) => isAdmin(identity, participantId),
            addAdmin: (participantId: string) => addAdmin(identity, participantId),
            removeAdmin: (participantId: string) => removeAdmin(identity, participantId),
        };
}
