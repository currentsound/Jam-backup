import type {IdentityWithKeys, JamAccess, JamRoom} from "$lib/types";
import {signedToken} from "$lib/common/tokens";

export {
  apiUrl,
  get,
    authedGet,
  post,
  put,
  putOrPost,
  deleteRequest,
  createRoom,
  updateRoom,
  getRoom,
  recordingsDownloadLink,
    getToken,
};

const API = '/api/v1';

function apiUrl() {
  return API;
}

async function authenticatedApiRequest(identity: IdentityWithKeys, method: 'GET' | 'PUT' | 'POST' | 'DELETE', path: string, payload: unknown) {
  const res = await fetch(API + path, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await signedToken(identity)}`
    },
    body: payload ? JSON.stringify(payload) : undefined
  });
  return res.ok;
}

// returns [data, ok, status]
async function get(path: string) {
  let res = await fetch(API + path, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });
  if (res.status < 400) return [await res.json(), true, res.status];
  else return [undefined, false, res.status];
}

// returns [data, ok, status]
async function authedGet<T = unknown>(identity: IdentityWithKeys, path: string): Promise<[data: T | undefined, ok: boolean, status: number]> {
  let res = await fetch(API + path, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${await signedToken(identity)}`,
    },
  });
  if (res.status < 400) return [await res.json(), true, res.status];
  else return [undefined, false, res.status];
}

async function post(identity: IdentityWithKeys, path: string, payload: unknown) {
  return authenticatedApiRequest(identity, 'POST', path, payload);
}

async function put(identity: IdentityWithKeys, path: string, payload: unknown) {
  return authenticatedApiRequest(identity, 'PUT', path, payload);
}

async function putOrPost(identity: IdentityWithKeys, path: string, payload: unknown) {
  return (
    (await put(identity, path, payload)) || (await post(identity, path, payload))
  );
}

async function deleteRequest(identity: IdentityWithKeys, path: string, payload: unknown = null) {
  return authenticatedApiRequest(identity, 'DELETE', path, payload);
}

async function createRoom(identity: IdentityWithKeys, roomId: string, room: Partial<JamRoom> = {}) {
  const {
    name = '',
    description = '',
    logoURI = undefined,
    color = undefined,
    stageOnly = false,
    videoCall = false,
    videoEnabled = false,
  } = room;

  let newRoom = {
    ...room,
    name,
    description,
    logoURI,
    color,
    stageOnly: !!stageOnly,
    videoCall: !!videoCall,
    videoEnabled: !!videoEnabled,
    moderators: [identity.info.id],
    speakers: [identity.info.id],
  };
  let ok = await post(identity, `/rooms/${roomId}`, newRoom);
  //if (ok) populateCache(API + `/rooms/${roomId}`, newRoom);
  // if (ok) setTimeout(() => populateCache(API + `/rooms/${roomId}`, room), 0);
  return ok;
}

async function updateRoom(identity: IdentityWithKeys, roomId: string, room: JamRoom) {
  if (!roomId || !room) return false;
  // don't accept updates that delete the moderator/speaker array
  // (=> explicitly set to [] if that is the intention)
  if (!room?.moderators || !room?.speakers) return false;
  return await put(identity, `/rooms/${roomId}`, room);
}

async function getRoom(roomId: string) {
  if (!roomId) return undefined;
  return (await get(`/rooms/${roomId}`))[0];
}

async function getToken(identity: IdentityWithKeys, roomId: string) {
  if (!roomId) return undefined;
  return (await authedGet<JamAccess>(identity, `/rooms/${roomId}/token`))[0];
}


async function recordingsDownloadLink(identity: IdentityWithKeys, roomId: string) {
  return `${API}/rooms/${roomId}/recordings.zip?token=${await signedToken(
    identity
  )}`;
}
