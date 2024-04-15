import {Endpoint, z} from 'sveltekit-api';
import {forbidden, notFound} from "$lib/server/errors";
import {leaveStage} from "$lib/server/handlers/room";
import {successSchema} from "$lib/types";

export const Param = z.object({
    id: z.string(),
    speakerId: z.string(),
})

export const Output = successSchema;

export const Error = {
    403: forbidden(),
    404: notFound()
};

export default new Endpoint({Param, Output, Error })
    .handle(leaveStage);
