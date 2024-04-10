import type {Authorizer, JamObject} from "$lib/types";
import {conflict, forbidden, notFound} from "$lib/server/errors";
import {z} from 'sveltekit-api';
import type {RequestEvent} from "@sveltejs/kit";

import {get, set} from '../services/redis';
import {permitAllAuthorizer} from "../authz";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const broadcast = <T>(room: string, topic: string, object: T) => undefined;

export const accessor = <T extends JamObject>({prefix}: {prefix: string}) => {
    const redisKey = (id: string) => prefix + '/' + id;

    return {
        get: async (id: string) => {
            await set(`activity/${prefix}/last-accessed`, Date.now());
            const object = await get(redisKey(id)) as T | undefined;
            return object && {...object, id};
        },
        set: async (object: T) => {
            await set(`activity/${prefix}/last-updated`, Date.now());
            await set(redisKey(object.id), object)
        },
    }
}

export const controller = <T extends JamObject>({
                        prefix,
                        authorizer,
                        schema,
                        broadcastRoom,
                        broadcastChannel,
                        postPost,
                        postPut,
                    }: {
        prefix: string,
        authorizer?: Authorizer<T>,
        schema: z.ZodType<T>,
        broadcastRoom?: (id: string) => string,
        broadcastChannel?: (id: string) => string,
        postPost?: (o: T) => Promise<unknown>,
        postPut?: (o: T) => Promise<unknown>,
}) => {
    const _authorizer = authorizer || permitAllAuthorizer;
    const {get, set} = accessor<T>({prefix});

    return {
    post: async (input: T, event: RequestEvent) => {
        const {id} = input;
        if (await get(id)) {
            throw conflict();
        } else {
            const object = schema.parse(input);
            if(!await _authorizer.canPost(object as unknown as T, event.locals.identity)) {
                throw forbidden();
            }
            await set(object);
            if(postPost) {
                await postPost(object);
            }
            return object;
        }
    },
    get: async (input: {id: string}, event: RequestEvent) => {
        const {id} = input;
        const object = await get(id);
        if(!object) {
            throw notFound();
        }
        if(!await _authorizer.canGet(object as unknown as T, event.locals.identity)) {
            throw forbidden();
        }
        return object;
    },
    put: async (input: T, event: RequestEvent) =>  {
        const {id} = input;
        if (await get(id)) {
            if(!await _authorizer.canPut(await get(id) as unknown as T, event.locals.identity)) {
                throw forbidden();
            }
            const newObject = schema.parse(input);
            await set(newObject);
            if(postPut) {
                await postPut(newObject);
            }

            if (broadcastRoom && broadcastChannel)
                broadcast<T>(
                    broadcastRoom(input.id),
                    broadcastChannel(input.id),
                    newObject
                );
            return newObject;
        } else {
            throw notFound();
        }
    },
}};
