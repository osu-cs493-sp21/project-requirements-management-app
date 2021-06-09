const Redis = require('ioredis')

const rateLimitWindowMS = 60000;
const rateLimitMaxRequests = 10;

const redisClient = new Redis({
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
});

function getUserTokenBucket(ip) {
  return new Promise((resolve, reject) => {
    redisClient.hgetall(ip, (err, tokenBucket) => {
      if (err) {
        reject(err);
      } else if (Object.keys(tokenBucket).length > 0) {
        tokenBucket.tokens = parseFloat(tokenBucket.tokens);
        resolve(tokenBucket);
      } else {
        resolve({
          tokens: rateLimitMaxRequests,
          last: Date.now()
        });
      }
    });
  });
}

function saveUserTokenBucket(ip, tokenBucket) {
  return new Promise((resolve, reject) => {
    redisClient.hmset(ip, tokenBucket, (err, resp) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

module.exports = async function rateLimit(req, res, next) {
  try {
    const tokenBucket = await getUserTokenBucket(req.ip);

    const currentTimestamp = Date.now();
    const ellapsedTime = currentTimestamp - tokenBucket.last || 0;

    tokenBucket.tokens += ellapsedTime *
      (rateLimitMaxRequests / rateLimitWindowMS);
    tokenBucket.tokens = Math.min(
      tokenBucket.tokens,
      rateLimitMaxRequests
    );
    tokenBucket.last = currentTimestamp;

    if (tokenBucket.tokens >= 1) {
      tokenBucket.tokens -= 1;
      await saveUserTokenBucket(req.ip, tokenBucket);
      next();
    } else {
      res.status(429).send({
        error: 'Too many request per minute. Please wait a bit...',
      });
    }
  } catch (err) {
    next();
  }
}
