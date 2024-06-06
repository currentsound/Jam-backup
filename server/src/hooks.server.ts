import { sequence } from '@sveltejs/kit/hooks';
import {authenticate} from "$lib/server/authn";
import initDb from "$lib/server/services/initDb";
import type {Reroute} from "@sveltejs/kit";

await initDb()

export const reroute: Reroute = ({ url }) => {
    if (url.pathname.startsWith('/_/pantry')) {
        return url.pathname.replace('/_/pantry', '');
    }
}

export const handle = sequence(
    authenticate,

);
