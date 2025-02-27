require('dotenv').config();

const jamHost = process.env.JAM_HOST || 'beta.jam.systems';
const local = process.env.LOCAL;
const restrictRoomCreation = !!process.env.JAM_RESTRICT_ROOM_CREATION;
const serverAdminId = process.env.JAM_SERVER_ADMIN_ID;
const recordFileLocationPath =
  process.env.RECORD_FILE_LOCATION_PATH || './records';
const hlsFileLocationPath = process.env.HLS_FILE_LOCATION_PATH || './hls';
const recordFileRetentionDays = process.env.RECORD_FILE_RETENTION_DAYS
  ? parseInt(process.env.RECORD_FILE_RETENTION_DAYS)
  : 1;

module.exports = {
  serverAdminId,
  jamHost,
  local,
  restrictRoomCreation,
  hlsFileLocationPath,
  recordFileLocationPath,
  recordFileRetentionDays,
};
