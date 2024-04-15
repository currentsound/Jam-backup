import type {KeyPair, KeyPairBytes, TokenEngine} from "$lib/types";
import * as wsr from './watsign-records.js';
import {Base64} from "js-base64";
import {b64FromUrl, b64ToUrl} from "$lib/utils";

const keypair = (identity: KeyPair): KeyPairBytes => {
    return {
        privateKey: Base64.toUint8Array(identity.privateKey),
        publicKey: Base64.toUint8Array(identity.publicKey),
    };
}


const signData = async (identity: KeyPair, data: unknown, messageValiditySeconds: number) => {

    const signedData = await wsr.signData({
        record: data,
        keypair: keypair(identity),
        validSeconds: messageValiditySeconds,
    });

    return Base64.encodeURL(JSON.stringify(signedData));
}


export const engine = (messageValiditySeconds: number): TokenEngine => ({

    signData: (keyPair, data) => signData(keyPair, data, messageValiditySeconds),
        verify: async <T = unknown>(token: string, key?: string) => {
            const verifiedRecord = await wsr.getVerifiedData(JSON.parse(Base64.decode(token)));
            if (!verifiedRecord) return;
            const {identities, data} = verifiedRecord;
            if (key && !identities.includes(b64FromUrl(key))) return;
            return {
                key: key || b64ToUrl(identities[0]),
                payload: data as T,
            };
        },

    signedToken: (identity: KeyPair) => signData(identity, {id: identity.publicKey}, messageValiditySeconds),

})
