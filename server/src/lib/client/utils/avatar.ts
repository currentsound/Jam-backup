import type {IdentityInfo, JamRoom} from "$lib/types";
import {Base64} from "js-base64";

const DEFAULT_AVATAR = `/img/avatar-default.png`;

const roomAvatar = (info: IdentityInfo, room: JamRoom | undefined, defaultAvatar: string) => {
  if (room?.userDisplay?.identities) {
    return room.userDisplay.identities[info.id].avatar || defaultAvatar;
  } else if (room?.userDisplay?.avatars) {
    return room.userDisplay.avatars[info.id] || defaultAvatar;
  } else if (room?.userDisplay?.randomIdentities) {
    return selectFromList(info.id, room.userDisplay?.randomIdentities).avatar;
  } else if (room?.userDisplay?.randomAvatars) {
    return selectFromList(info.id, room.userDisplay.randomAvatars);
  } else {
    return defaultAvatar;
  }
};

const roomDisplayName = (info: IdentityInfo, room: JamRoom): string => {
  if (room.userDisplay?.identities) {
    return (
      room.userDisplay.identities[info.id].name ||
      selectFromList(info.id, names)
    );
  } else if (room.userDisplay?.names) {
    return room.userDisplay.names[info.id] || selectFromList(info.id, names);
  } else if (room.userDisplay?.randomIdentities) {
    return selectFromList<IdentityInfo>(info.id, room.userDisplay.randomIdentities).name || selectFromList(info.id, names);
  } else if (room.userDisplay?.randomNames) {
    return selectFromList(info.id, room.userDisplay?.randomNames);
  } else {
    return selectFromList(info.id, names);
  }
};

export const avatarUrl = (info: IdentityInfo, room?: JamRoom, defaultAvatar = DEFAULT_AVATAR) => {
  if (info.avatar && !room?.access?.identitiesLocked) {
    return info.avatar;
  } else {
    return roomAvatar(info, room, defaultAvatar);
  }
};

export const displayName = (info: IdentityInfo, room?: JamRoom): string => {
  const infoName = info.name;
  if (infoName && !room?.access?.identitiesLocked) {
    return infoName;
  } else if (room) {
    return roomDisplayName(info, room);
  } else {
    return selectFromList(info.id, names);
  }
};

const selectFromList = <T>(id: string, list: T[]) => {
  return list[publicKeyToIndex(id, list.length)];
};

const names = [
  'Ali',
  'Alex',
  'Ash',
  'Blue',
  'Chi',
  'Drew',
  'Eight',
  'Fin',
  'Floor',
  'Five',
  'Four',
  'Jam',
  'Jaz',
  'Misha',
  'Mu',
  'Nine',
  'One',
  'Pat',
  'Sam',
  'Sasha',
  'Seven',
  'Six',
  'Sky',
  'Sol',
  'Storm',
  'Sun',
  'Tao',
  'Ten',
  'Three',
  'Tsu',
  'Two',
  'Yu',
  'Zero',
];

const integerFromBytes = (rawBytes: Uint8Array) =>
  rawBytes[0] + (rawBytes[1] << 8) + (rawBytes[2] << 16) + (rawBytes[3] << 24);

function publicKeyToIndex(publicKey: string, range: number) {
  const bytes = Base64.toUint8Array(publicKey);
  return Math.abs(integerFromBytes(bytes)) % range;
}
