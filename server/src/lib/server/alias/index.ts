import type {Handle} from "@sveltejs/kit";


export const alias: Handle = async ({resolve, event}) => {
    if(event.url.pathname.startsWith('/_/pantry')) {
        event.url.pathname = event.url.pathname.replace('/_/pantry', '');
    }
    return resolve(event);
};

