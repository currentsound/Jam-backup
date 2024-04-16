import {Endpoint, z} from 'sveltekit-api';
import {successSchema} from '$lib/types';
import {forbidden} from "$lib/server/errors";
import {addAdmin, isAdmin} from "$lib/server/authz";

export const Output = successSchema;
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
        await addAdmin(id);
        return {success: true};
    });
