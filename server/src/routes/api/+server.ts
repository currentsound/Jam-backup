import api from '$api';
import { json, type RequestEvent } from '@sveltejs/kit';
import { tree } from 'sveltekit-api';


export const GET = async (evt: RequestEvent) => {
  return json(await api.openapi(evt));
};
