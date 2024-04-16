import {Endpoint, z} from 'sveltekit-api';
import {adminStatusSchema} from '$lib/types';
import {forbidden} from "$lib/server/errors";
import {isAdmin} from "$lib/server/authz";

export const Output = adminStatusSchema;
export const Param = z.object({
    id: z.string(),
})

export const Error = {
    403: forbidden(),
};

export default new Endpoint({Param, Output, Error })
    .handle(async ({id}, event) => {
        if(!await isAdmin(event.locals.identity)) {
            throw forbidden();
        }
        return {admin: await isAdmin({id})};
    });
