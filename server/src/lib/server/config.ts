import { config } from 'dotenv';

config();

export const jamHost = process.env.JAM_HOST || 'beta.jam.systems';
export const local = process.env.LOCAL;
export const redisHost = process.env.REDIS_HOST || 'redis';
export const restrictRoomCreation = !!process.env.JAM_RESTRICT_ROOM_CREATION;
export const serverAdminId = process.env.JAM_SERVER_ADMIN_ID;
export const recordFileLocationPath =
  process.env.RECORD_FILE_LOCATION_PATH || './records';
export const hlsFileLocationPath = process.env.HLS_FILE_LOCATION_PATH || './hls';
export const recordFileRetentionDays = process.env.RECORD_FILE_RETENTION_DAYS
  ? parseInt(process.env.RECORD_FILE_RETENTION_DAYS)
  : 1;
export const livekitUrl = process.env.LIVEKIT_URL || 'https://demo.jamrelay.cloud';
export const livekitKey = process.env.LIVEKIT_KEY;
export const livekitSecret = process.env.LIVEKIT_SECRET;

console.log(livekitKey, livekitSecret);
