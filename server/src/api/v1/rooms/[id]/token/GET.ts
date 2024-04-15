import {Endpoint, z} from 'sveltekit-api';
import {jamAccessSchema} from '$lib/types';
import {forbidden, notFound} from "$lib/server/errors";
import {roomAccessor} from "$lib/server/handlers/room";
import {livekitUrl} from "$lib/server/config";
import {createAccessToken} from "$lib/server/services/livekit";

export const Output = jamAccessSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    403: forbidden(),
    404: notFound()
};



export default new Endpoint({Param, Output, Error }).handle(async (input, event) => {
    const room = await roomAccessor.get(input.id);

    if(!room) {
        throw notFound();
    }

    if(!event.locals.identity) {
        throw forbidden();
    }

    return {
        livekitUrl,
        token: await createAccessToken(room, event.locals.identity),

    }
});
