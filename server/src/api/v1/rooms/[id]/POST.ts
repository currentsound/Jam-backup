import {Endpoint, z} from 'sveltekit-api';
import {jamRoomSchema} from '$lib/types';
import {conflict} from "$lib/server/errors";
import {roomHandler} from "$lib/server/handlers/room";

export const Input = jamRoomSchema;
export const Output = jamRoomSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    409: conflict(),
};

export default new Endpoint({Param, Input, Output, Error }).handle(roomHandler.post);
