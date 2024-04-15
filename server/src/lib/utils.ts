import {z} from "sveltekit-api";

export const asyncFilter = async <T>(
    arr: T[],
    predicate: (e: T) => Promise<boolean>,
) =>
    Promise.all(arr.map(predicate)).then((results) =>
        arr.filter((_v, index) => results[index]),
    );

export const pof = <T, V>(schema: z.ZodType<T>, data: unknown, fallback: V): T | V   => {
    const result = schema.safeParse(data);
    return result.success ? result.data : fallback;
}

export const pou = <T>(schema: z.ZodType<T>, data: unknown) => pof<T, undefined>(schema, data, undefined);

export const concatBytes = (...arrays: Uint8Array[]) => {
    if (!arrays.length) return new Uint8Array();
    let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
    let result = new Uint8Array(totalLength);
    let length = 0;
    for (let array of arrays) {
        result.set(array, length);
        length += array.length;
    }
    return result;
}

export const b64FromUrl = (url: string) => {
    return (
        url.replace(/-/g, '+').replace(/_/g, '/') +
        '===='.slice(0, (4 - (url.length % 4)) % 4)
    );
}

export const b64ToUrl = (url: string) => {
    return url.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
