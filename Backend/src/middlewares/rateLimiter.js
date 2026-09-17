import crypto from 'crypto';
import redisWrapper from '../config/redis.js';

const windowsize = 3600; // 60 minutes
const max_Request = 20;

const rateLimiter = async (req, res, next) => {
  try {
    const ip = `IP:${req.ip}`;
    const currentTime = Date.now() / 1000;
    const window_time = currentTime - windowsize;

    await redisWrapper.zRemRangeByScore(ip, 0, window_time);
    const number_of_request = await redisWrapper.zCard(ip);

    if (number_of_request > max_Request) {
      return res.status(429).json({ success: false, message: 'Rate limit exceeded, try again later.' });
    }

    const randomNumber = crypto.randomBytes(8).toString('hex');
    await redisWrapper.zAdd(ip, [
      {
        score: currentTime,
        value: `${currentTime}:${randomNumber}`,
      },
    ]);

    await redisWrapper.expire(ip, windowsize);
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error Occurred: ' + err.message });
  }
};

export default rateLimiter;