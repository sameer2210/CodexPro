import redis from 'redis';

const client = redis.createClient({
  username: 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_STRING,
    port: process.env.REDIS_PORT_NO ? Number(process.env.REDIS_PORT_NO) : undefined,
  },
});

client.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

client.on('connect', () => {
  console.log('✅ Redis Connected');
});

client.on('end', () => {
  console.log('⚠️ Redis Connection Closed');
});

const redisWrapper = {
  connect: async () => {
    if (!client.isOpen && process.env.REDIS_STRING) {
      await client.connect();
    }
  },
  set: (key, value) => (client.isOpen ? client.set(key, value) : Promise.resolve(null)),
  get: (key) => (client.isOpen ? client.get(key) : Promise.resolve(null)),
  del: (key) => (client.isOpen ? client.del(key) : Promise.resolve(null)),
  exists: (key) => (client.isOpen ? client.exists(key) : Promise.resolve(0)),
  expire: (key, seconds) => (client.isOpen ? client.expire(key, seconds) : Promise.resolve(null)),
  expireAt: (key, timestamp) => (client.isOpen ? client.expireAt(key, timestamp) : Promise.resolve(null)),
  zAdd: (key, members) => (client.isOpen ? client.zAdd(key, members) : Promise.resolve(null)),
  zCard: (key) => (client.isOpen ? client.zCard(key) : Promise.resolve(0)),
  zRemRangeByScore: (key, min, max) => (client.isOpen ? client.zRemRangeByScore(key, min, max) : Promise.resolve(null)),
};

export default redisWrapper;
