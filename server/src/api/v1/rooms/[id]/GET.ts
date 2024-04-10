import {Endpoint, z} from 'sveltekit-api';
import {jamRoomSchema} from '$lib/types';
import {forbidden, notFound} from "$lib/server/errors";
import {roomHandler} from "$lib/server/handlers/room";

export const Output = jamRoomSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    403: forbidden(),
    404: notFound()
};

export default new Endpoint({Param, Output, Error }).handle(roomHandler.get);
