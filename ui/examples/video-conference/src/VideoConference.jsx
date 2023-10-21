import React, {useState, useEffect} from 'react';
import useResizeObserver from 'use-resize-observer';
import {JamProvider, useJam, use} from 'jam-core-react';

import './VideoConference.scss';
import {calculateGeometry, simpleHash, parseConfig} from './lib/utils';

const Video = ({peerStream, width, height}) => {
  const style = {
    width: `${width}px`,
    height: `${height}px`,
  };
  const {stream, peerId} = peerStream;
  const videoRef = React.createRef();
  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream, videoRef]);

  return (
    <div className="video-container" style={style}>
      <video
        style={{height: `${height}px`}}
        ref={videoRef}
        autoPlay
        playsInline
      />
    </div>
  );
};

const VideoConferenceUI = ({config}) => {
  const [
    state,
    {createRoom, setProps, enterRoom, leaveRoom, switchCamera},
  ] = useJam();
  let [myId, inRoom, peers, peerState, myVideo, remoteVideoStreams] = use(
    state,
    ['myId', 'inRoom', 'peers', 'peerState', 'myVideo', 'remoteVideoStreams']
  );

  const joinedPeers = peers.filter(id => peerState[id]?.inRoom);

  const join = async e => {
    e.preventDefault();
    await setProps({userInteracted: true});
    await createRoom(config.roomId, {stageOnly: true, videoCall: true});
    await setProps('roomId', config.roomId);
    await enterRoom(config.roomId);
  };
  const leave = async e => {
    e.preventDefault();
    await leaveRoom();
    await setProps('roomId', null);
  };

  const [showSettings, setShowSettings] = useState(false);

  const allParticipants = [
    ...joinedPeers.map(
      peerId => remoteVideoStreams.find(s => s.peerId === peerId) || {peerId}
    ),
    {peerId: myId, stream: myVideo},
    {peerId: myId, stream: myVideo},
    {peerId: myId, stream: myVideo},
    {peerId: myId, stream: myVideo},
    {peerId: myId, stream: myVideo},
  ];

  const sortedParticipants = allParticipants.sort(function (a, b) {
    return simpleHash(a.peerId + config.roomId).localeCompare(
      simpleHash(b.peerId + config.roomId)
    );
  });

  const {ref, width = 1, height = 1} = useResizeObserver();

  const {videoWidth, videoHeight} = calculateGeometry({
    width,
    height,
    n: sortedParticipants.length,
  });

  const videoElements = sortedParticipants.map((peerStream, index) => {
    return (
      <Video
        key={index}
        peerStream={peerStream}
        width={videoWidth}
        height={videoHeight}
      />
    );
  });

  return (
    <div className="jam-video-conference">
      {showSettings ? (
        <div className="settings">
          {inRoom ? (
            <button onClick={leave}>Leave Room</button>
          ) : (
            <button onClick={join} disabled={!(config.roomId?.length > 3)}>
              Join Room
            </button>
          )}
          <select
            value={selectedMicrophoneId}
            onChange={e => selectMicrophoneFromDeviceId(e.target.value)}
          >
            {availableMicrophones.map(mic => (
              <option key={mic.deviceId} value={mic.deviceId}>
                {mic.label}
              </option>
            ))}
          </select>

          <button onClick={switchCamera}>Switch camera</button>
          <button
            className="close-settings-button"
            onClick={() => setShowSettings(false)}
          >
            Close Settings
          </button>
          {config.debug && (
            <pre>
              {width} {height}
            </pre>
          )}
        </div>
      ) : (
        <button
          className="settings-button"
          onClick={() => setShowSettings(true)}
        >
          ⚙
        </button>
      )}
      <div className="videos" ref={ref}>
        {inRoom ? (
          videoElements
        ) : (
          <div className="lobby">
            <pre>
              {JSON.stringify(myVideo)}
              {JSON.stringify(myId)}
            </pre>
            <button onClick={join} disabled={!(config.roomId?.length > 3)}>
              Join
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export const VideoConference = ({jamConfig}) => {
  const [config, setConfig] = useState(parseConfig(location.hash.slice(1)));

  useEffect(() => {
    let hashChange = () => {
      setConfig(parseConfig(location.hash.slice(1)));
    };
    window.addEventListener('hashchange', hashChange);
    return () => {
      window.removeEventListener('hashchange', hashChange);
    };
  });

  return (
    <>
      <JamProvider options={{jamConfig}}>
        <VideoConferenceUI config={config} />
      </JamProvider>
    </>
  );
};
