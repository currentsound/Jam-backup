import {createClient} from 'redis';
import {local, redisHost} from '../config.js';
import {readFileSync} from "fs";
import {existsSync, writeFileSync} from "node:fs";

const localStoreFilename = '.localData.json'

const localStore: Record<string, unknown> = existsSync(localStoreFilename) ? JSON.parse(readFileSync(localStoreFilename).toString()) : {};

let get = async (key: string) => localStore[key];
let set = async (key: string, value: unknown) => {
  localStore[key] = value;
  writeFileSync(localStoreFilename, JSON.stringify(localStore, null, 4));
};
let del = async (key: string) => {
  delete localStore[key];
  writeFileSync(localStoreFilename, JSON.stringify(localStore, null, 4));

};
let list = async (prefix: string) => Object.keys(localStore).filter(key => key.startsWith(prefix));
let roomCount = async () =>
    Object.keys(localStore).filter(key => key.startsWith('rooms/')).length;
let identityCount = async () =>
    Object.keys(localStore).filter(key => key.startsWith('identities/')).length;

if(!local) {
  const client = createClient({url: `redis://${redisHost}`}).connect();
  client.then(c => c.on('error', async (err) => {
    console.log('error connecting to redis, host redis');
    console.error(err);
    await c.quit();
  }));

  roomCount = async () => (await client.then(c => c.keys('rooms/*'))).length;
  identityCount = async () => (await client.then(c => c.keys('identities/*'))).length;
  set = async (key: string, value: unknown) => {await client.then(c => c.set(key, JSON.stringify(value)))};
  get = async (key: string) => client.then(c => c.get(key).then(v => v && JSON.parse(v)));
  del = (key: string) => client.then(c => c.del(key).then(() => undefined));
  list = (prefix: string) => client.then(c => c.keys(`${prefix}*`));
}

export {
  get,
  set,
  del,
  list,
  roomCount,
  identityCount,
};
