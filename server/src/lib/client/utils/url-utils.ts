import {Base64} from "js-base64";

export {parsePath, parseUrlConfig};

function parsePath(pathname: string) {
  const [first = null, second] = pathname.split('/').filter(Boolean);
  const stageOnly = first === 's';
  const videoEnabled = first === 'v';
  // other special configs go here
  const route = stageOnly || videoEnabled ? second : first;
  const room = {stageOnly, videoEnabled};
  return {route, room};
}

function parseUrlConfig(search: string, hash: string) {
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
  const nextObject = o[key] as Config;
  return {
    ...o,
    [key]: writeToPath(nextObject, path.slice(1), value)
  }
}
