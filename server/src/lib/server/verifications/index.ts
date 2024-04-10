import twitter from './twitter';
import type {VerifiableIdentity} from "$lib/types";

const verifiers = {
  twitter: twitter.verify,
};

export default async (identities: VerifiableIdentity[], publicKey: string) => {
  if (Array.isArray(identities)) {
    for (const identity of identities) {
      if (!verifiers[identity.type]) {
        throw new Error(`No verifier for identity type ${identity.type}`);
      }
      if (identity.verificationInfo) {
        await verifiers[identity.type](identity, publicKey);
      }
    }
  } else {
    throw new Error('Identities object is not an array');
  }
};
