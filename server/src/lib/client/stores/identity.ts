import {keyPairFromSecretKey, keyPairFromSeed, newKeyPair} from 'watsign';
import {putOrPost} from '$lib/client/backend';
import {persisted} from "svelte-persisted-store";
import type {Identities, IdentityInfo, IdentityWithKeys} from "$lib/types";
import {derived, get, type Stores} from "svelte/store";
import {Base64} from "js-base64";


const isDefault = (identity: IdentityWithKeys, identities: Identities) =>
    !identities?._default || identities._default?.publicKey === identity.publicKey;

export const identitiesStore = persisted<Identities>('identities', {});

export const updateIdentity = (roomId: string, identity: IdentityWithKeys) => {
  identitiesStore.update((identities) => ({
    ...identities,
    [isDefault(identity, identities) ? '_default' : roomId]: identity
  }));

  return putOrPost(
      identity,
      `/identities/${identity.publicKey}`,
      identity.info
  );

}


const createDefaultIdentityIfNeeded = async () => {

  if (!get(identitiesStore)?._default) {
    const defaultIdentity = await createIdentity();
    await updateIdentity('_default', defaultIdentity);
    return defaultIdentity;
  } else {
    return get(identitiesStore)._default;
  }
};

export const identityForRoom = (roomId: string) => derived<Stores, IdentityWithKeys>(identitiesStore, $identities =>
    $identities[roomId] ?? $identities._default);

const setCurrentIdentity = (roomId: string, identity: IdentityWithKeys) => identitiesStore.update((identities) =>
  ({...identities, [identities[roomId] ? roomId : '_default']: identity}));

async function importDefaultIdentity(
  identity: Partial<IdentityWithKeys> & {seed?: string}
) {
  await importRoomIdentity('_default', identity);
}

async function importRoomIdentity(
  roomId: string,
  identity: Partial<IdentityWithKeys> & {seed?: string}
) {
  let fullIdentity: IdentityWithKeys;
  let existingIdentity = get(identitiesStore)[roomId];
  if (identity.privateKey && identity.publicKey) {
    fullIdentity = {
      publicKey: identity.publicKey,
      privateKey: identity.privateKey,
      info: {...identity.info, id: identity.publicKey},
    };
  } else if (identity.privateKey) {
    fullIdentity = await createIdentityFromSecretKey(
      identity.info,
      identity.privateKey
    );
  } else if (identity.seed) {
    fullIdentity = await createIdentityFromSeed(identity.info, identity.seed);
  } else if (existingIdentity) {
    fullIdentity = existingIdentity;
    fullIdentity.info = {
      ...existingIdentity.info,
      ...identity.info,
      id: existingIdentity.publicKey,
    };
  } else {
    fullIdentity = await createIdentity(identity.info);
  }

  return updateIdentity(roomId, fullIdentity);
}

async function createIdentityFromSecretKey(
  info: IdentityInfo | undefined,
  privatekeyBase64: string
) {
  const keypair = await keyPairFromSecretKey(Base64.toUint8Array(privatekeyBase64));
  return createIdentityFromKeypair(info, keypair);
}

async function createIdentityFromSeed(
  info: IdentityInfo | undefined,
  seedString: string
) {
  const hash = new Uint8Array(
    await crypto.subtle.digest('SHA-512', new TextEncoder().encode(seedString))
  ).slice(0, 32);
  const keypair = await keyPairFromSeed(hash);
  return createIdentityFromKeypair(info, keypair);
}

async function createIdentity(info?: IdentityInfo) {
  const keypair = await newKeyPair();
  return createIdentityFromKeypair(info, keypair);
}

function createIdentityFromKeypair(
  info: IdentityInfo | undefined,
  keypair: {secretKey: Uint8Array; publicKey: Uint8Array}
) {
  const publicKey = Base64.fromUint8Array(keypair.publicKey, true);
  const privateKey = Base64.fromUint8Array(keypair.secretKey, true);
  return {
    publicKey,
    privateKey,
    info: {
      ...info,
      id: publicKey,
    },
  };
}

const migrateKeyPairs = () => {
  if (!globalThis.window.localStorage.getItem('jam-migrations-key-pairs')) {
    const identities = JSON.parse(globalThis.window.localStorage.getItem('identities') ?? '{}');

    if(identities) {
      for (const key of Object.keys(identities)) {
        const identity = identities[key];
        if ('secretKey' in identity && !('privateKey' in identity)) {
          identity.privateKey = identity.secretKey;
          identity.secretKey = undefined;
          identities[key] = identity;
        }
      }
      window.localStorage.setItem('identities', JSON.stringify(identities));
    }
  }
}

export const initializeIdentities = async () => {
  await createDefaultIdentityIfNeeded();
  migrateKeyPairs();
  return get(identitiesStore);
}
