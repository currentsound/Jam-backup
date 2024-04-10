import { sequence } from '@sveltejs/kit/hooks';
import {authenticate} from "$lib/server/authn";
import initDb from "$lib/server/services/initDb";

await initDb()
export const handle = sequence(
  authenticate,
);
