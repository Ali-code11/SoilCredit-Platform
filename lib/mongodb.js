import { MongoClient } from 'mongodb';

const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'soilcredit' ? process.env.DB_NAME : 'soilcredit';
const globalWithMongo = globalThis;
let newsIndexesPromise;

function getClientPromise() {
  if (!process.env.MONGO_URL) throw new Error('Database is not configured. Set MONGO_URL and restart the server.');
  if (!globalWithMongo._soilCreditMongoClientPromise) {
    const clientPromise = new MongoClient(process.env.MONGO_URL).connect();
    globalWithMongo._soilCreditMongoClientPromise = clientPromise;
    clientPromise.catch(() => {
      if (globalWithMongo._soilCreditMongoClientPromise === clientPromise) {
        delete globalWithMongo._soilCreditMongoClientPromise;
      }
    });
  }
  return globalWithMongo._soilCreditMongoClientPromise;
}

export async function getDb() {
  const client = await getClientPromise();
  return client.db(DB_NAME);
}

export async function ensureNewsIndexes(collection) {
  if (!newsIndexesPromise) {
    newsIndexesPromise = Promise.all([
      collection.createIndex({ slug: 1 }, { unique: true, name: 'news_slug_unique' }),
      collection.createIndex({ status: 1, publishedAt: -1 }, { name: 'news_status_published_at' }),
      collection.createIndex({ updatedAt: -1 }, { name: 'news_updated_at' }),
    ]).catch((error) => {
      newsIndexesPromise = undefined;
      throw error;
    });
  }
  await newsIndexesPromise;
}
