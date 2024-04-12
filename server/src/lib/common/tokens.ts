import {decodeProtectedHeader, importJWK, type JWTPayload, jwtVerify, SignJWT} from "jose";
import type {KeyPair} from "$lib/types";

const MESSAGE_VALIDITY_SECONDS = 300;



const publicJWK = (base64urlPublicKey: string) => importJWK({
    kty: 'OKP',
    crv: 'Ed25519',
    x: base64urlPublicKey,
});

const privateJWK = (base64urlPublicKey: string, base64urlPrivateKey: string) => importJWK({
    kty: 'OKP',
    crv: 'Ed25519',
    d: base64urlPrivateKey,
    x: base64urlPublicKey,
});


export const signData = async ({publicKey, privateKey}: KeyPair, payload: unknown) => {
    const signer = new SignJWT(payload as JWTPayload)
        .setProtectedHeader({ alg: 'EdDSA' })
        .setIssuedAt();
    signer.setExpirationTime(`${MESSAGE_VALIDITY_SECONDS} seconds`);
    return signer.sign(await privateJWK(publicKey, privateKey));
}


export const verify = async (token: string, key?: string) => {
    const verificationKey = key || decodeProtectedHeader(token).kid;

    if(!verificationKey) {
        return undefined;
    }

    try {
        return {
            key: verificationKey,
            payload: await jwtVerify(token, await publicJWK(verificationKey), {algorithms: ['EdDSA']})
        };
    } catch {
        return undefined;
    }
}

export const signedToken = (keyPair: KeyPair) => signData(keyPair, {id: keyPair.publicKey});
