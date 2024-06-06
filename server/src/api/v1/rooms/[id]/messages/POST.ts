import {Endpoint, z} from 'sveltekit-api';
import {jamMessageSchema} from '$lib/types';
import {forbidden} from "$lib/server/errors";
import {uuidv7} from "uuidv7";
import {set} from "$lib/server/services/redis";
import {isInRoom} from "$lib/server/services/livekit";

export const Input = jamMessageSchema;
export const Output = jamMessageSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    403: forbidden(),
};

export default new Endpoint({Param, Input, Output, Error })
    .handle(async (params, event) => {
    if(!(await isInRoom(params.id, event.locals.identity))) {
        throw forbidden();
    }

    const messageId = uuidv7();
    const redisKey = `messages/${params.id}/${messageId}`;
    const message = {...jamMessageSchema.parse(params), id: messageId};
    await set(redisKey, message);
    return message;
});
