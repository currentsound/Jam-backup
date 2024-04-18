import {accessor, controller} from "$lib/server/handlers/helpers";
import {type JamRoom, jamRoomSchema, type Success} from "$lib/types";
import {roomAuthorizer} from "../authz";
import {createOrUpdateRoom, roomServiceClient} from "$lib/server/services/livekit";
import {forbidden, notFound} from "$lib/server/errors";
import type {RequestEvent} from "@sveltejs/kit";


export const roomAccessor = accessor<JamRoom>({prefix: 'rooms'});
export const roomHandler = controller<JamRoom>({
   prefix: 'rooms',
   schema: jamRoomSchema,
   authorizer: roomAuthorizer,
   broadcastRoom: (id) => id,
   broadcastChannel: () => 'room-info',
    postPost: createOrUpdateRoom,
    postPut: createOrUpdateRoom
});

export const leaveStage = async (params: {id: string, speakerId: string}, event: RequestEvent): Promise<Success> => {
    const room = await roomAccessor.get(params.id);
    if(!room) {
        throw notFound();
    }
    const identity = event.locals.identity;
    if(identity?.id !== params.speakerId) {
        throw forbidden();
    }
    const updatedRoom = {...room, speakers: room.speakers.filter(id => id !== params.speakerId)};
    await roomAccessor.set(updatedRoom);
    await createOrUpdateRoom(updatedRoom);
    return {success: true}
}
