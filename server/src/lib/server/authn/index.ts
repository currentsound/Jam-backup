import type {Handle} from "@sveltejs/kit";
import {identityAccessor} from "$lib/server/handlers/identity";
import {verify} from "$lib/common/tokens";

const extractToken = (req: Request) => {
  const authHeader = req.headers.get('Authorization');
  return (authHeader && authHeader.substring(6)) || new URL(req.url).searchParams.get('token') || '';
};

export const authenticate: Handle = async ({ resolve, event }) => {
         try {

          const verifiedRecord = await verify(extractToken(event.request));
          if (verifiedRecord?.key) {
            event.locals.identity = await identityAccessor.get(verifiedRecord.key);
          }
        } catch (_) {/* do nothing */}
        return resolve(event);
};

