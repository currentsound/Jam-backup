import React from 'react';
import ReactDOM from 'react-dom/client';

import {VideoConference} from './VideoConference.jsx';

const jamConfig = {
  domain: 'beta.jam.systems',
  development: true,
  sfu: true,
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <VideoConference jamConfig={jamConfig} />
);
