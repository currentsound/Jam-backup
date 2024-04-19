import {Endpoint, z} from 'sveltekit-api';
import {adminStatusSchema} from '$lib/types';
import {forbidden} from "$lib/server/errors";
import {isAdmin} from "$lib/server/authz";

export const Output = z.any(); //adminStatusSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    403: forbidden(),
};

export default new Endpoint({Param, Output, Error })
    .handle(async ({id}, event) => {
        return {admin: await isAdmin({id})};
    });
