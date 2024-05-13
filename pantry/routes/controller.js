const express = require('express');
const {broadcast} = require('../services/ws');
const {get, set} = require('../services/redis');

const permitAllAuthenticator = {
  canPost: (req, res, next) => next(),
  canPut: (req, res, next) => next(),
  canGet: (req, res, next) => next(),
};

const controller = ({
  prefix,
  authenticator,
  broadcastRoom,
  broadcastChannel,
  postCreate,
}) => {
  const _authenticator = authenticator || permitAllAuthenticator;

  const redisKey = req => prefix + '/' + req.params.id;
  const router = express.Router();
  const path = `/${prefix}/:id`;

  router.post(path, _authenticator.canPost, async function (req, res) {
    const key = redisKey(req);
    if (await get(key)) {
      res.sendStatus(409);
    } else {
      await set(key, req.body);
      await set(`activity/${prefix}/last-created`, Date.now());
      if (postCreate) {
        postCreate(req.body);
      }
      res.send(req.body);
    }
  });
  router.get(path, _authenticator.canGet, async function (req, res) {
    const room = await get(redisKey(req));
    if (room) {
      await set(`activity/${prefix}/last-accessed`, Date.now());
      res.send(room);
    } else {
      res.sendStatus(404);
    }
  });
  router.put(path, _authenticator.canPut, async function (req, res) {
    const key = redisKey(req);
    if (await get(key)) {
      await set(key, req.body);
      await set(`activity/${prefix}/last-accessed`, Date.now());
      if (broadcastRoom && broadcastChannel)
        broadcast(
          broadcastRoom(req.params.id),
          broadcastChannel(req.params.id),
          req.body
        );
      res.send(req.body);
    } else {
      res.sendStatus(404);
    }
  });
  return router;
};

module.exports = {controller, permitAllAuthenticator};
