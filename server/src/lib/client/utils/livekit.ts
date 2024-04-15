import type {Room} from "livekit-client";
import {pou} from "$lib/utils";
import {type JamMessage, type JamRoom, jamRoomSchema} from "$lib/types";

export const toJamRoom = (room: Room) => pou<JamRoom>(
    jamRoomSchema,
    JSON.parse(room.metadata ?? '{}')
);

export const sendJamMessage = (room: Room, message: JamMessage, destinationIdentities?: string[]) =>
    room.localParticipant.publishData(new TextEncoder().encode(JSON.stringify(message)), {
        destinationIdentities,
    });
