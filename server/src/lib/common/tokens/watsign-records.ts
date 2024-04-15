import {sign, verify} from 'watsign';
import {concatBytes} from '$lib/utils';
import type {KeyPairBytes} from "$lib/types";
import {Base64} from "js-base64";

export {signData, verifyData, getVerifiedData};

interface Signature {
  Identity: string,
  Payload: string,
}

interface SignedRecord {
  Version: 0,
  Certified: string,
  KeyType: 'ed25519',
  Expiration: number,
  Signatures: Signature[],
}

async function signData({record, keypair, validSeconds, validUntil}:{record: unknown, keypair: KeyPairBytes, validSeconds?: number, validUntil?: number}) {
  let Certified = Base64.fromUint8Array(
    new TextEncoder().encode(JSON.stringify(record))
  );
  let Expiration =
    validUntil || (validSeconds || 1800) + Math.floor(Date.now() / 1000.0);
  let bytesToSign = await createBytesToSign({
    Version: 0,
    Expiration,
    KeyType: 'ed25519',
    Certified,
  });
  let Signatures = [];
  try {
    Signatures.push(await createSignature(bytesToSign, keypair));
  } catch {}

  return {
    Version: 0,
    Expiration,
    KeyType: 'ed25519',
    Certified,
    Signatures,
  };
}

// TODO: improve protocol
// async function verifyData({expiration, certified, signature}, key) {
//   let ok = false;
//   if (signature.key !== fromUrl(key)) return;
//   try {
//     const bytesToSign = await createBytesToSign({expiration, certified});
//     let signatureBytes = await toBytes(signature.payload);
//     let publicKey = await toBytes(signature.key);
//     ok = await verify(bytesToSign, signatureBytes, publicKey);
//   } catch (e) {
//     console.log('error verifying', e);
//     return;
//   }
//   if (!ok) return;
//   return JSON.parse(certified);
// }
async function verifyData(signedRecord: SignedRecord) {
  try {
    let bytesToSign = createBytesToSign(signedRecord);
    if (signedRecord.Version !== 0) {
      return false;
    }
    return (await Promise.all(
      signedRecord.Signatures.map(signature => {
        return verify(
          bytesToSign,
          Base64.toUint8Array(signature.Payload),
          Base64.toUint8Array(signature.Identity)
        );
      })
    )).every(s => s);
  } catch (e) {
    return false;
  }
}

async function getVerifiedData(signedRecord: SignedRecord) {
  if (await verifyData(signedRecord)) {
    let dataRaw = Base64.toUint8Array(signedRecord.Certified);
    let data = JSON.parse(new TextDecoder().decode(dataRaw));
    return {
      data,
      identities: signedRecord.Signatures.map(s => s.Identity),
    };
  }
  return undefined;
}

async function createSignature(bytesToSign: Uint8Array, {publicKey, privateKey}: KeyPairBytes) {
  let signatureBytes = await sign(bytesToSign, privateKey);
  let signature = Base64.fromUint8Array(signatureBytes);
  return {
    Identity: Base64.fromUint8Array(publicKey),
    Payload: signature,
  };
}

function createBytesToSign({Version, Expiration, KeyType, Certified}: {Version: 0, Expiration: number, KeyType: 'ed25519', Certified: string}) {
  let versionBytes = new Uint8Array(4);
  let expirationBytes = new Uint8Array(8);
  let keyTypeBytes = new TextEncoder().encode(KeyType);
  let payloadBytes = Base64.toUint8Array(Certified);
  // let payloadBytes = new TextEncoder().encode(certified);

  // Convert the version into a little-endian uint32 representation
  for (let i = 0; i < 4; i++) {
    versionBytes[i] = (Version >> (8 * i)) & 0xff;
  }
  // TODO: this is incorrect, n >> 32 is just n >> 0 = n (the shift amount is taken mod 32)
  // Convert the timestamp into a little-endian uint64 representation
  for (let i = 0; i < 8; i++) {
    expirationBytes[i] = (Expiration >> (8 * i)) & 0xff;
  }
  return concatBytes(versionBytes, expirationBytes, keyTypeBytes, payloadBytes);
}
