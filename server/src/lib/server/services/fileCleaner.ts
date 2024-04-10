import {stat, rm, opendir, readdir} from 'node:fs/promises';
import path from 'path';
import {recordFileLocationPath, recordFileRetentionDays} from '../config';

const CLEANING_INTERVAL = 60 * 60 * 1000;

const cleanDirectory = async (recordingPath: string) => {
  try {
    if ((await stat(recordingPath)).isDirectory()) {
      for await (const dirent of await opendir(recordingPath)) {
        const entryPath = path.join(recordingPath, dirent.name);
        if (dirent.isDirectory()) {
          await cleanDirectory(entryPath);
        } else if (dirent.isFile()) {
          const stats = await stat(entryPath);
          if (
            stats.mtimeMs <
            Date.now() - recordFileRetentionDays * 24 * 60 * 60 * 1000
          ) {
            console.log(`Removing ${entryPath}.`);
            await rm(entryPath);
          }
        }
      }
      if (
        recordingPath !== recordFileLocationPath &&
        (await readdir(recordingPath)).length === 0
      ) {
        console.log(`Removing ${recordingPath}.`);
        await rm(recordingPath, {recursive: true});
      }
    }
  } catch (e) {
    console.log('Cleanup error:');
    console.log(e);
  }
};

export const setupCleaner = async () => {
  setInterval(async () => {
    console.log(
      `Starting cleanup of recordings older than ${recordFileRetentionDays} day${
        recordFileRetentionDays > 1 ? 's' : ''
      } ...`
    );
    await cleanDirectory(recordFileLocationPath);
    console.log('Cleanup complete.');
  }, CLEANING_INTERVAL);
};

