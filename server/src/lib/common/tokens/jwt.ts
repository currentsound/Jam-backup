import {decodeProtectedHeader, importJWK, type JWTPayload, jwtVerify, SignJWT} from "jose";
import type {KeyPair, TokenEngine} from "$lib/types";

const publicJWK = (base64urlPublicKey: string) => importJWK({
    kty: 'OKP',
    crv: 'Ed25519',
    x: base64urlPublicKey,
}, 'ECDSA');

const privateJWK = (base64urlPublicKey: string, base64urlPrivateKey: string) => importJWK({
    kty: 'OKP',
    crv: 'Ed25519',
    d: base64urlPrivateKey,
    x: base64urlPublicKey,
}, 'ECDSA');

const signData = async ({publicKey, privateKey}: KeyPair, payload: unknown, messageValiditySeconds: number) => {
        const signer = new SignJWT(payload as JWTPayload)
            .setProtectedHeader({alg: 'EdDSA'})
            .setIssuedAt();
        signer.setExpirationTime(`${messageValiditySeconds} seconds`);
        return signer.sign(await privateJWK(publicKey, privateKey));
    }

export const engine = (messageValiditySeconds: number): TokenEngine => ({
    signData: async ({publicKey, privateKey}: KeyPair, payload: unknown) =>
        signData({publicKey, privateKey}, payload, messageValiditySeconds),
    verify:  async <T = unknown>(token: string, key?: string) => {
        const verificationKey = key || decodeProtectedHeader(token).kid;

        if(!verificationKey) {
            return undefined;
        }

        try {
            return {
                key: verificationKey,
                payload: (await jwtVerify(
                    token,
                    await publicJWK(verificationKey),
                    {algorithms: ['EdDSA']}
                )) as T
            };
        } catch {
            return undefined;
        }
    },

    signedToken: (keyPair: KeyPair) => signData(keyPair, {id: keyPair.publicKey}, messageValiditySeconds),

});


