import type {Handle} from "@sveltejs/kit";
import {decodeProtectedHeader, importJWK, jwtVerify} from "jose";
import {identityAccessor} from "$lib/server/handlers/identity";

const extractToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  return (authHeader && authHeader.substring(6)) || new URL(req.url).searchParams.get('token') || '';
};

const verify = async (token: string) => {
  const key = decodeProtectedHeader(token).kid;
  try {
    return {
      key,
      payload: await jwtVerify(token, await importJWK({
        kty: 'OKP',
        crv: 'Ed25519',
        x: key,
      }), {algorithms: ['EdDSA']})
    };
  } catch {
    return undefined;
  }
}

export const authenticate: Handle = async ({ resolve, event }) => {
         try {

          const verifiedRecord = await verify(extractToken(event.request));
          if (verifiedRecord?.key) {
            event.locals.identity = await identityAccessor.get(verifiedRecord.key);
          }
        } catch (_) {/* do nothing */}
        return resolve(event);
};

