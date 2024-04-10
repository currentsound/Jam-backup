import {accessor, controller} from "$lib/server/handlers/helpers";
import {type IdentityInfo, identityInfoSchema} from "$lib/types";
import {identityAuthorizer} from "../authz";


export const identityAccessor = accessor<IdentityInfo>({prefix: 'identities'});

export const identityHandler = controller<IdentityInfo>({
   prefix: 'identities',
   schema: identityInfoSchema,
   authenticator: identityAuthorizer,
});
