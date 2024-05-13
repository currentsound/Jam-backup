const express = require('express');
const cors = require('cors');
const logger = require('morgan');

const {ssr} = require('./ssr');

require('./services/initDb')();

const indexRouter = require('./routes/index');
const metricsRouter = require('./routes/metrics');
const activityRouter = require('./routes/activity');
const adminRouter = require('./routes/admin');

const {roomAuthenticator, identityAuthenticator} = require('./auth');
const {controller} = require('./routes/controller');
const roomKeyRouter = require('./routes/roomKey');
const liveRoomRouter = require('./routes/liveRoom');
const recordingsRouter = require('./routes/recordings');
//const jamConfigRouter = require('./routes/jamConfig');
const {hlsFileLocationPath} = require('./config');
const app = express();

app.use(logger('dev'));
app.use(cors());
app.use(express.json({limit: '500kb'}));
app.use(ssr);

app.use('/', indexRouter);
app.use('/metrics', metricsRouter);
app.use('/activity', activityRouter);
//app.use('/jam-config', jamConfigRouter);

app.use('/stream/hls', express.static(hlsFileLocationPath));

app.use(
  '/api/v1/',
  controller({
    prefix: 'rooms',
    authenticator: roomAuthenticator,
    broadcastRoom: id => id,
    broadcastChannel: () => 'room-info',
  })
);
app.use('/api/v1/rooms/:id/roomKey', roomKeyRouter);
app.use('/api/v1/rooms/:id/live', liveRoomRouter);
app.use('/api/v1/rooms/:id/recordings.zip', recordingsRouter);

app.use(
  '/api/v1/',
  controller({prefix: 'identities', authenticator: identityAuthenticator})
);

app.use('/api/v1/admin/', adminRouter);

module.exports = app;
