import { error } from 'sveltekit-api';

export const authNeeded = (message = 'Authentication needed') =>
	error(401,message);
export const forbidden = (message = 'Forbidden') =>
	error(403, message);
export const notFound = (target?: string) =>
	error(404, target ? `${target} not found` : 'Not found');
export const conflict = (message = 'Conflict') =>
	error(409, message);
export const unprocessableRequest = (message = 'Invalid request') =>
	error(422, message);
export const internalError = (message = 'Internal error') =>
	error(500, message);

