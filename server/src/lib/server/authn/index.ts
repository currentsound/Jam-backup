import type {Handle} from "@sveltejs/kit";
import {identityAccessor} from "$lib/server/handlers/identity";
import {verify} from "$lib/common/tokens";
import {fromBase64} from "js-base64";

const extractToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  return (authHeader && authHeader.substring(6)) || new URL(req.url).searchParams.get('token') || '';
};

export const authenticate: Handle = async ({ resolve, event }) => {
         try {
             console.log('Extracting token')
             const token = extractToken(event.request);
             console.log('token', token);
          const verifiedRecord = await verify(token);
             console.log('record', verifiedRecord);
             console.log(fromBase64(token));
          if (verifiedRecord?.key) {
            event.locals.identity = await identityAccessor.get(verifiedRecord.key);
          }
        } catch (_) {/* do nothing */}
        return resolve(event);
};

