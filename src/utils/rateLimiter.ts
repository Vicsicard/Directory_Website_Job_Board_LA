import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const RATE_LIMIT_COLLECTION = 'api_rate_limits';

// Rate limit settings
const GLOBAL_RATE_LIMIT = {
  maxRequests: 2500,  // 50% of Google's free tier (5000)
  windowMs: 24 * 60 * 60 * 1000,  // 24 hours
};

const IP_RATE_LIMIT = {
  maxRequests: 100,  // per IP
  windowMs: 60 * 60 * 1000,  // 1 hour
};

interface RateLimitDoc {
  _id: string;
  count: number;
  resetAt: Date;
  type: 'global' | 'ip';
}

let cachedClient: MongoClient | null = null;

async function getCollection() {
  if (!cachedClient) {
    cachedClient = await MongoClient.connect(MONGODB_URI!);
  }
  const db = cachedClient.db('directory_db');
  return db.collection<RateLimitDoc>(RATE_LIMIT_COLLECTION);
}

export async function initializeRateLimiting() {
  const collection = await getCollection();
  
  // Create indexes
  await collection.createIndex({ resetAt: 1 }, { expireAfterSeconds: 86400 }); // TTL index
  await collection.createIndex({ _id: 1, type: 1 });
  
  console.log('Rate limiting initialized');
}

export async function checkRateLimit(ip: string): Promise<{
  allowed: boolean;
  remaining: { global: number; ip: number };
  resetAt: { global: Date; ip: Date };
}> {
  const collection = await getCollection();
  const now = new Date();

  // Check and update global rate limit
  const globalKey = 'global_daily';
  const globalLimit = await collection.findOneAndUpdate(
    {
      _id: globalKey,
      type: 'global',
      resetAt: { $gt: now }
    },
    {
      $setOnInsert: {
        _id: globalKey,
        type: 'global',
        count: 0,
        resetAt: new Date(now.getTime() + GLOBAL_RATE_LIMIT.windowMs)
      },
      $inc: { count: 1 }
    },
    { upsert: true, returnDocument: 'after' }
  );

  // Check and update IP rate limit
  const ipKey = `ip_${ip}`;
  const ipLimit = await collection.findOneAndUpdate(
    {
      _id: ipKey,
      type: 'ip',
      resetAt: { $gt: now }
    },
    {
      $setOnInsert: {
        _id: ipKey,
        type: 'ip',
        count: 0,
        resetAt: new Date(now.getTime() + IP_RATE_LIMIT.windowMs)
      },
      $inc: { count: 1 }
    },
    { upsert: true, returnDocument: 'after' }
  );

  const globalCount = globalLimit.value?.count || 0;
  const ipCount = ipLimit.value?.count || 0;

  const allowed = 
    globalCount <= GLOBAL_RATE_LIMIT.maxRequests &&
    ipCount <= IP_RATE_LIMIT.maxRequests;

  return {
    allowed,
    remaining: {
      global: GLOBAL_RATE_LIMIT.maxRequests - globalCount,
      ip: IP_RATE_LIMIT.maxRequests - ipCount
    },
    resetAt: {
      global: globalLimit.value?.resetAt || new Date(now.getTime() + GLOBAL_RATE_LIMIT.windowMs),
      ip: ipLimit.value?.resetAt || new Date(now.getTime() + IP_RATE_LIMIT.windowMs)
    }
  };
}

export async function getRateLimitStats() {
  const collection = await getCollection();
  const now = new Date();

  const globalStats = await collection.findOne({ _id: 'global_daily', type: 'global' });
  const ipStats = await collection.find({ type: 'ip', resetAt: { $gt: now } }).toArray();

  return {
    global: {
      current: globalStats?.count || 0,
      limit: GLOBAL_RATE_LIMIT.maxRequests,
      resetAt: globalStats?.resetAt || new Date(now.getTime() + GLOBAL_RATE_LIMIT.windowMs)
    },
    ips: {
      active: ipStats.length,
      totalRequests: ipStats.reduce((sum, doc) => sum + doc.count, 0)
    }
  };
}
