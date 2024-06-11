import {Base64} from "js-base64";
import {type DynamicConfig, dynamicConfigSchema} from "$lib/types";
import {z} from "sveltekit-api";

export {parseUrlConfig};

function parseUrlConfig(search: string, hash: string): DynamicConfig {
  const hashContent = hash.slice(1);
  const queryString = search.slice(1);

  if (hashContent) {
    try {
      return JSON.parse(Base64.decode(hashContent));
    } catch {
      return parseParams(hashContent);
    }
  }

  if (queryString) {
    try {
      dynamicConfigSchema.parse(parseParams(queryString));
    } catch (e) {
      if(e instanceof z.ZodError) {
        console.log(e.toString());
      }
      console.log(e);
    }
    return parseParams(queryString);
  }

  return {};
}

interface Config {
  [key: string]: string | Config
}

function parseParams(params: string) {
  return params.split('&').reduce((res: Config, item: string) => {
    const [key, value] = item.split('=').map(decodeURIComponent);

    const path = key.split('.');
    return (path.length > 0 ? writeToPath(res, path, value) : res) as Config;
  }, {} as Config);
}

const writeToPath = (o: Config, path: string[], value: string): Config | string => {
  if(path.length === 0) {
    return value;
  }
  const key = path[0];
  const nextObject = o[key] as Config ?? {};
  return {
    ...o,
    [key]: writeToPath(nextObject, path.slice(1), value)
  }
}
