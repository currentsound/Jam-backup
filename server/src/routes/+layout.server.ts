import type {RequestEvent} from "@sveltejs/kit";
import type {StaticConfig, RoomOptions} from "$lib/types";
import {livekitUrl} from "$lib/server/config";

const defaultRoomOptions: Partial<RoomOptions> = {
    dynacast: true,
    adaptiveStream: true,
    videoCaptureDefaults: {
        resolution: {
            height: 200,
            width: 200
        }
    }
}

export const load = async (event: RequestEvent): Promise<{jamConfig: StaticConfig}> => ({
    jamConfig: {
        defaultRoom: {
            name: "JamRoom",
            speakers: [],
            moderators: [],
            presenters: []
        },
        livekit: {
            url: livekitUrl,
            roomOptions: defaultRoomOptions,
        }

    },
});
