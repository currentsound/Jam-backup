import {Endpoint, z} from 'sveltekit-api';
import {identityInfoSchema} from '$lib/types';
import {conflict} from "$lib/server/errors";
import {identityHandler} from "$lib/server/handlers/identity";

export const Input = identityInfoSchema;
export const Output = identityInfoSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    409: conflict(),
};

export default new Endpoint({Param, Input, Output, Error }).handle(identityHandler.post);
