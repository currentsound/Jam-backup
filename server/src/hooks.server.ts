import { sequence } from '@sveltejs/kit/hooks';
import {authenticate} from "$lib/server/authn";
import initDb from "$lib/server/services/initDb";
import {alias} from "$lib/server/alias";

await initDb()
export const handle = sequence(
    alias,
    authenticate,

);
