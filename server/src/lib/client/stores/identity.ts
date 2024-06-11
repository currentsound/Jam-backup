import {keyPairFromSecretKey, keyPairFromSeed, newKeyPair} from 'watsign';
import {putOrPost} from '$lib/client/backend';
import type {Identities, IdentityInfo, IdentityWithKeys} from "$lib/types";
import {Base64} from "js-base64";
import type {PartialDeep} from "type-fest";

const identities = () => JSON.parse(localStorage.getItem('identities') ?? '{}') as Identities;
const store = (identities: Identities) => localStorage.setItem('identities', JSON.stringify(identities));


const isDefault = (identity: IdentityWithKeys, identities: Identities) =>
    !identities?._default || identities._default?.publicKey === identity.publicKey;

export const defaultIdentity = () => identities()._default;

export const uploadIdentity = (identity: IdentityWithKeys) => putOrPost(
      identity,
      `/identities/${identity.publicKey}`,
      identity.info
  );

export const updateIdentity = (roomId: string, identity: IdentityWithKeys) => {
  const oldIdentities = identities();
  store({
    ...oldIdentities,
    [isDefault(identity, oldIdentities) ? '_default' : roomId]: identity
  });

  return uploadIdentity(identity);

}


const createDefaultIdentityIfNeeded = async () => {

  if (!identities()._default) {
    const defaultIdentity = await createIdentity();
    await updateIdentity('_default', defaultIdentity);
    return defaultIdentity;
  } else {
    return identities()._default;
  }
};

export const identityForRoom = (roomId: string) => identities()[roomId] ?? identities()._default;


async function importDefaultIdentity(
  identity: Partial<IdentityWithKeys> & {seed?: string}
) {
  await importRoomIdentity('_default', identity);
}

export async function importRoomIdentity(
  roomId: string,
  identity: PartialDeep<IdentityWithKeys> & {seed?: string}
) {
  let fullIdentity: IdentityWithKeys;
  let existingIdentity = identities()[roomId];
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
  info: PartialDeep<IdentityInfo> | undefined,
  privatekeyBase64: string
) {
  const keypair = await keyPairFromSecretKey(Base64.toUint8Array(privatekeyBase64));
  return createIdentityFromKeypair(info, keypair);
}

async function createIdentityFromSeed(
  info: PartialDeep<IdentityInfo> | undefined,
  seedString: string
) {
  const hash = new Uint8Array(
    await crypto.subtle.digest('SHA-512', new TextEncoder().encode(seedString))
  ).slice(0, 32);
  const keypair = await keyPairFromSeed(hash);
  return createIdentityFromKeypair(info, keypair);
}

async function createIdentity(info?: PartialDeep<IdentityInfo>) {
  const keypair = await newKeyPair();
  return createIdentityFromKeypair(info, keypair);
}

function createIdentityFromKeypair(
  info: PartialDeep<IdentityInfo> | undefined,
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

export const identityReady = (async () => {
  if(globalThis.window) {
    await createDefaultIdentityIfNeeded().then(uploadIdentity);
    migrateKeyPairs();
  }
})()
