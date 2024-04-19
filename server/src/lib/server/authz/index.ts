import {get, set} from '../services/redis';
import type {Authorizer, IdentityInfo, JamRoom} from "$lib/types";
import verifyIdentities from '../verifications';
import {restrictRoomCreation} from '../config';

export const permitAllAuthorizer: Authorizer<unknown> = {
  canPost: async () => true,
  canPut: async () => true,
  canGet: async () => true,
};


export const hasAccessToRoom = (room: JamRoom, identity: IdentityInfo) =>
  !room.access || (room.access && room.access.identities?.includes(identity.id));

export const isModerator = (room: JamRoom, identity?: IdentityInfo) => !!identity && room.moderators.includes(identity.id);

export const isAdmin = async (identity?: IdentityInfo) => {
  const adminKeys = await get('server/admins') as string[];
  return !!(identity && adminKeys?.includes(identity.id));
};


export const addAdmin = async (serverAdminId: string) => {
  const currentServerAdmins = await get('server/admins') as string[];
  if (currentServerAdmins && !currentServerAdmins.includes(serverAdminId)) {
    currentServerAdmins.push(serverAdminId);
    await set('server/admins', currentServerAdmins);
  } else {
    await set('server/admins', [serverAdminId]);
  }
};

export const removeAdmin = async (serverAdminId: string) => {
  const currentServerAdmins = await get('server/admins') as string[];
  const newServerAdmins = currentServerAdmins.filter(e => e !== serverAdminId);
  await set('server/admins', newServerAdmins);
};

export const initializeServerAdminIfNecessary = async (id: string) => {
  const admins = await get('server/admins') as string[];
  if (!admins || admins.length === 0) {
    await set('server/admins', [id]);
  }
};

export const roomAuthorizer: Authorizer<JamRoom> = {
  ...permitAllAuthorizer,
  canPost: async (_, identity) =>
      !(restrictRoomCreation && !(await isAdmin(identity))),
  canPut: async (room, identity) =>
      isModerator(room, identity)
};

export const identityAuthorizer: Authorizer<IdentityInfo> = {
  ...permitAllAuthorizer,
  canPost: async (identity) => {
    await initializeServerAdminIfNecessary(identity.id);
    return true;
  },
  canPut: async (identity, authenticatedIdentity) => {

    if(identity.id !== authenticatedIdentity?.id) {
      return false;
    }

    if (identity.identities) {
      try {
        await verifyIdentities(identity.identities, identity.id);
      } catch (error) {
        return false;
      }
    }

    await initializeServerAdminIfNecessary(identity.id);
    return true
  },
};

