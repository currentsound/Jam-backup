import {Room} from "livekit-client";

export const switchToNextCamera = async (room: Room) => {

    const currentCameraId = room.getActiveDevice("videoinput");

    const devices = await Room.getLocalDevices("videoinput");

    const currentIndex = devices.findIndex(d => d.deviceId === currentCameraId);

    const newIndex = (currentIndex + 1) % devices.length;

    return room.switchActiveDevice("videoinput", devices[newIndex].deviceId);
}


