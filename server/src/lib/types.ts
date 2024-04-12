import { z } from 'sveltekit-api';
import type {Room} from "livekit-server-sdk";
import type {SvelteComponent} from "svelte";

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
    displayName: z.string().optional(),
    avatar: z.string().optional(),
    identities: verifiableIdentitySchema.array().optional(),
}).openapi('IdentityInfo');

export type IdentityInfo = z.infer<typeof identityInfoSchema>;

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

export const jamRoomSchema = z.object({
    id: z.string().min(5),
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
    }).optional()
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
})

export interface KeyPair {
    publicKey: string,
    privateKey: string,
}

export interface JamApi {}
export interface JamState {
    roomId: string,
    livekit: {
        room: Room,
        token: string,
    }
}

export interface Modal {
    id: string,
    component: SvelteComponent
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
    identity: identityInfoSchema,
    state: participantStateSchema
})
