import type {RequestEvent} from "@sveltejs/kit";
import type {RoomData} from "$lib/types";
import {roomAccessor} from "$lib/server/handlers/room";

export const ssr = false;

export const load = async (event: RequestEvent): Promise<{roomData: RoomData}> => ({
    roomData: {
        jamRoom: await roomAccessor.get(event.params.roomId || ''),
    },
});
