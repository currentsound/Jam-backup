import {engine as jwt} from './jwt';
import {engine as ssr} from './ssr';

const MESSAGE_VALIDITY_SECONDS = 300;

const TOKEN_ENGINE: 'JWT' | 'SSR' = 'SSR';

export const {signData, verify, signedToken} =
    TOKEN_ENGINE === 'SSR' ? ssr(MESSAGE_VALIDITY_SECONDS) : jwt(MESSAGE_VALIDITY_SECONDS);
