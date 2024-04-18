import { z } from 'sveltekit-api';
import type {Room} from "livekit-server-sdk";
import type {ComponentProps, ComponentType, SvelteComponent} from "svelte";
import type {Readable, Writable} from "svelte/store";
import {LocalTrackPublication, type Participant, Room as ClientRoom, type Track} from "livekit-client";

export const accessSchema = z.object({
    identities: z.string().array().optional(),
    identitiesLocked: z.boolean().optional(),
});

export const verifiableIdentitySchema = z.object({
    type: z.enum(['twitter']),
    id: z.string(),
    verificationInfo: z.string()
});

export type VerifiableIdentity = z.infer<typeof verifiableIdentitySchema>;

export const identityInfoSchema = z.object({
    id: z.string(),
    name: z.string().optional(),
    avatar: z.string().optional(),
    identities: verifiableIdentitySchema.array().optional(),
}).openapi('IdentityInfo');

export type IdentityInfo = z.infer<typeof identityInfoSchema>;

export const identityWithKeysSchema = z.object({
    publicKey: z.string(),
    privateKey: z.string(),
    info: identityInfoSchema,
});
export type IdentityWithKeys = z.infer<typeof identityWithKeysSchema>;

export const baseColorsSchema = z.object({
    background: z.string(),
    header: z.string(),
    text: z.string(),
    link: z.string(),
    buttonPrimary: z.string(),
    buttonSecondary: z.string(),
});

export const colorsSchema = baseColorsSchema.partial().openapi('JamRoomColors');

export type JamRoomColors = z.infer<typeof colorsSchema>;

export const completedColorsSchema = baseColorsSchema.extend({
    textLight: z.string(),
    textSuperLight: z.string(),
});
export type CompletedJamRoomColors = z.infer<typeof completedColorsSchema>;


export const jamScheduleSchema = z.object({
    date: z.string().datetime(),
    time: z.string(),
    timezone: z.string(),
    repeat: z.enum(['weekly', 'monthly']).optional(),
});
export type JamSchedule = z.infer<typeof jamScheduleSchema>;

export const jamRoomSchema = z.object({
    id: z.string().min(4),
    name: z.string(),
    description:
        z.string().optional(),
    speakers: z.string().array(),
    moderators: z.string().array(),
    presenters: z.string().array(),
    videoEnabled: z.boolean().optional(),
    stageOnly: z.boolean().optional(),
    videoCall: z.boolean().optional(),
    color: z.string().optional(),
    logoURI: z.string().url().optional(),
    buttonURI: z.string().url().optional(),
    buttonText: z.string().url().optional(),
    access: accessSchema.optional(),
    broadcastRoom: z.boolean().optional(),
    userDisplay: z.object({
        identities: z.record(identityInfoSchema),
        avatars: z.record(z.string()),
        names: z.record(z.string()),
        randomIdentities: identityInfoSchema.array(),
        randomAvatars: z.string().array(),
        randomNames: z.string().array(),
    }).partial().optional(),
    theme: z.object({
        colors: colorsSchema.optional()
    }).optional(),
    closed: z.boolean().optional(),
    schedule: jamScheduleSchema.optional(),
}).openapi('JamRoom');

export type JamRoom = z.infer<typeof jamRoomSchema>;

export interface Authorizer<T> {
    canPost: (object: T, identity?: IdentityInfo) => Promise<boolean>;
    canPut: (object: T, identity?: IdentityInfo) => Promise<boolean>;
    canGet: (object: T, identity?: IdentityInfo) => Promise<boolean>;
}

export type JamObject = Record<string, unknown> & {id: string}

export const jamAccessSchema = z.object({
    token: z.string(),
    livekitUrl: z.string().url(),
});
export type JamAccess = z.infer<typeof jamAccessSchema>;

export interface KeyPair {
    publicKey: string,
    privateKey: string,
}

export interface KeyPairBytes {
    publicKey: Uint8Array,
    privateKey: Uint8Array,
}


export interface JamApi {}
export interface JamState {
    roomId: string,
    livekit: {
        room: Room,
        token: string,
    }
}

export interface Modal<T extends SvelteComponent = SvelteComponent> {
    id: string,
    componentType: ComponentType<T>,
    props: ComponentProps<T>,
}

export const jamReactionSchema = z.object({
        type: z.literal('reaction'),
        id: z.string().uuid(),
        reaction: z.string(),
    });

export type JamReaction = z.infer<typeof jamReactionSchema>;

export const jamMessageSchema = z.discriminatedUnion('type', [
    jamReactionSchema,
])

export type JamMessage = z.infer<typeof jamMessageSchema>;

export const participantStateSchema = z.object({
    handRaised: z.boolean(),
})

export type ParticipantState = z.infer<typeof participantStateSchema>;

export const participantMetadataSchema = z.object({
    info: identityInfoSchema,
    state: participantStateSchema
})
export type ParticipantMetadata = z.infer<typeof participantMetadataSchema>;

export const uxConfigSchema = z.object({
    autoJoin: z.boolean().optional(),
    autoRejoin: z.boolean().optional(),
    autoCreate: z.boolean().optional(),
    userInteracted: z.boolean().optional(),
    noWebviewWarning: z.boolean().optional(),
    noLeave: z.boolean().optional(),
});

export const dynamicConfigSchema = z.object({
    room: jamRoomSchema.partial(),
    ux: uxConfigSchema.optional(),
    identity: identityInfoSchema.optional(),
    keys: z.any(),
})

export type DynamicConfig = z.infer<typeof dynamicConfigSchema>;

export const roomOptionsSchema = z.object({
    adaptiveStream: z.boolean(),
    dynacast: z.boolean(),
    videoCaptureDefaults: z.object({
        resolution: z.object({
            height: z.number(),
            width: z.number(),
        })
    }),

});

export type RoomOptions = z.infer<typeof roomOptionsSchema>;

export const staticConfigSchema = z.object({
   defaultRoom: jamRoomSchema.partial(),
    livekit: z.object({
        url: z.string().url(),
        roomOptions: roomOptionsSchema.partial()
    })
});

export type StaticConfig = z.infer<typeof staticConfigSchema>;

export type Identities = Record<string, IdentityWithKeys>;

export const successSchema = z.object({success: z.literal(true)});

export type Success = z.infer<typeof successSchema>;

export const roomDataSchema = z.object({
    jamRoom: jamRoomSchema.optional(),
})

export type RoomData = z.infer<typeof roomDataSchema>;

export interface RoomAPI {
    updateRoom: (room: JamRoom) => Promise<boolean>,
    getDisplayName: (info: IdentityInfo) => string | undefined,
    addSpeaker: (participantId: string) => Promise<boolean>,
    addModerator: (participantId: string) => Promise<boolean>,
    addPresenter: (participantId: string) => Promise<boolean>,
    removeSpeaker: (participantId: string) => Promise<boolean>,
    removeModerator: (participantId: string) => Promise<boolean>,
    removePresenter: (participantId: string) => Promise<boolean>,
    updateInfo: (info: IdentityInfo) => Promise<boolean>,
    updateState: (state: ParticipantState) => void,
    enterRoom: () => Promise<void>,
    leaveRoom: () => void,
    leaveStage: () => Promise<boolean>,
    sendReaction: (reaction: string) => Promise<void>,
    autoJoinOnce: () => void,
    switchCamera: () => Promise<boolean>,
    setCameraOn: (cameraOn: boolean) => Promise<LocalTrackPublication | undefined>,
    toggleCamera: () => Promise<LocalTrackPublication | undefined>,
    toggleMicrophone: () => void,
    selectMicrophone: (mic: InputDeviceInfo) => Promise<boolean>,
    startScreenShare: () => Promise<LocalTrackPublication | undefined>,
    stopScreenShare: () => Promise<LocalTrackPublication | undefined>,
    startRecording: () => void,
    stopRecording: () => void,
    downloadRecording: () => void,
    startPodcastRecording: () => void,
    stopPodcastRecording: () => void,
}

export interface ServerAPI {
    createRoom: (roomId: string, partialRoom?: Partial<JamRoom>) => Promise<boolean>,
    getRoom: (roomId: string) => Promise<JamRoom>,
    isAdmin: (participantId: string) => Promise<boolean>,
    addAdmin: (participantId: string) => Promise<boolean>,
    removeAdmin: (participantId: string) => Promise<boolean>,
}

export interface ParticipantContext {
    id: string,
    participant: Participant,
    info: IdentityInfo,
    state: ParticipantState,
    tracks: Track[],
    cameraTrack: Track<Track.Kind.Video> | undefined,
    microphoneTrack: Track<Track.Kind.Audio> | undefined,
    microphoneEnabled: boolean,
    microphoneMuted: boolean,
    screenTrack: Track<Track.Kind.Video> | undefined,
    isSpeaking: boolean,
    roles: {
        speaker: boolean,
        moderator: boolean,
        presenter: boolean,
    }
}

export interface Me extends ParticipantContext {
    hasMicFailed: boolean,
}

export interface RoomContext {
    state: {
        roomId: string,
        livekitRoom: Readable<ClientRoom>,
        jamRoom: Readable<JamRoom | undefined>,
        colors: Readable<CompletedJamRoomColors>,
        me: Readable<Me>,
        participants: Readable<ParticipantContext[]>,
        reactions: Readable<Record<string, JamReaction[]>>
    },
    api: Readable<RoomAPI>,
}

export interface ServerContext {
    config: StaticConfig,
    api: Readable<ServerAPI>,
}

export interface ActionsContext {
    showActions: Writable<boolean>,
    showRoleActions: Writable<string | undefined>,
}

export interface TokenEngine {
    signData: (keyPair: KeyPair, payload: unknown) => Promise<string>,
    verify: <T = unknown>(token: string, key?: string) => Promise<{key: string, payload: T} | undefined>
    signedToken: (keyPair: KeyPair) => Promise<string>,
}

export const adminStatusSchema = z.object({
    admin: z.boolean()
});
export type AdminStatus = z.infer<typeof adminStatusSchema>;
