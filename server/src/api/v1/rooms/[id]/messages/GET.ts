import {Endpoint, z} from 'sveltekit-api';
import {jamMessageSchema} from '$lib/types';
import {forbidden, notFound} from "$lib/server/errors";
import {isInRoom} from "$lib/server/services/livekit";
import {list} from "$lib/server/services/redis";

export const Output = jamMessageSchema.array();
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    403: forbidden(),
    404: notFound()
};

export default new Endpoint({Param, Output, Error })
    .handle(async (params, event) => {
        if(!(await isInRoom(params.id, event.locals.identity))) {
            throw forbidden();
        }
        const redisPrefix = `messages/${params.id}/`;
        return list(redisPrefix).then(os => os.map(o => jamMessageSchema.parse(o)))
    });
