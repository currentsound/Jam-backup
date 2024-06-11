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

export const load = async (): Promise<{jamConfig: StaticConfig}> => ({
    jamConfig: {
        defaultRoom: {
            name: "",
        },
        livekit: {
            url: livekitUrl,
            roomOptions: defaultRoomOptions,
        }

    },
});
