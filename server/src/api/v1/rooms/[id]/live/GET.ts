import {Endpoint, z} from 'sveltekit-api';
import {type IdentityInfo, identityInfoSchema} from '$lib/types';
import {notFound} from "$lib/server/errors";
import {roomAccessor} from "$lib/server/handlers/room";
import {roomServiceClient} from "$lib/server/services/livekit";

export const Output = identityInfoSchema.array();
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    404: notFound()
};



export default new Endpoint({Param, Output, Error }).handle(async (input) => {
    const room = await roomAccessor.get(input.id);

    if(!room) {
        throw notFound();
    }

    return await roomServiceClient.listParticipants(input.id).then(ps => ps.map(p => JSON.parse(p.metadata).info as IdentityInfo));
});
