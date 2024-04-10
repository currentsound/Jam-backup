import { z } from 'sveltekit-api';

export const accessSchema = z.object({
    identities: z.string().array().optional(),
    identitiesLocked: z.boolean().optional(),
});

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
    logoURI: z.string().url(),
    access: accessSchema.optional(),
    broadcastRoom: z.boolean().optional(),
}).openapi('JamRoom');

export type JamRoom = z.infer<typeof jamRoomSchema>;

export interface Authorizer<T> {
    canPost: (object: T, identity?: IdentityInfo) => Promise<boolean>;
    canPut: (object: T, identity?: IdentityInfo) => Promise<boolean>;
    canGet: (object: T, identity?: IdentityInfo) => Promise<boolean>;
}

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
});

export type IdentityInfo = z.infer<typeof identityInfoSchema>;
export type JamObject = Record<string, unknown> & {id: string}

export const jamAccessSchema = z.object({
    token: z.string(),
    livekitUrl: z.string().url(),
})
