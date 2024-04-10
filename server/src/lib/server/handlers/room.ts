import {accessor, controller} from "$lib/server/handlers/helpers";
import {type JamRoom, jamRoomSchema} from "$lib/types";
import {roomAuthorizer} from "../authz";
import {roomServiceClient} from "$lib/server/services/livekit";


const createLivekitRoom = async (room: JamRoom) =>
   roomServiceClient.createRoom({
      name: room.id,
      metadata: JSON.stringify(room),
   });

const updateLivekitRoom = async (room: JamRoom) =>
    roomServiceClient.updateRoomMetadata(room.id, JSON.stringify(room));

export const roomAccessor = accessor<JamRoom>({prefix: 'rooms'});
export const roomHandler = controller<JamRoom>({
   prefix: 'rooms',
   schema: jamRoomSchema,
   authenticator: roomAuthorizer,
   broadcastRoom: (id) => id,
   broadcastChannel: () => 'room-info',
    postPost: createLivekitRoom,
    postPut: updateLivekitRoom
});
