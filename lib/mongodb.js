import { MongoClient } from 'mongodb';

const DB_NAME = process.env.DB_NAME && process.env.DB_NAME !== 'soilcredit' ? process.env.DB_NAME : 'soilcredit';
const globalWithMongo = globalThis;
let newsIndexesPromise;
let newsletterIndexesPromise;

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

export async function ensureNewsletterIndexes(db) {
  if (!newsletterIndexesPromise) {
    newsletterIndexesPromise = Promise.all([
      db.collection('newsletterSubscribers').createIndex({ email: 1 }, { unique: true, name: 'newsletter_subscriber_email_unique' }),
      db.collection('newsletterSubscribers').createIndex({ status: 1, createdAt: 1 }, { name: 'newsletter_subscriber_status_created' }),
      db.collection('newsletterSubscribers').createIndex({ confirmationTokenHash: 1 }, { unique: true, sparse: true, name: 'newsletter_confirmation_token_unique' }),
      db.collection('newsletterSubscribers').createIndex({ unsubscribeTokenHash: 1 }, { unique: true, sparse: true, name: 'newsletter_unsubscribe_token_unique' }),
      db.collection('newsletterCampaigns').createIndex({ articleId: 1 }, { unique: true, name: 'newsletter_campaign_article_unique' }),
      db.collection('newsletterCampaigns').createIndex({ status: 1, createdAt: 1 }, { name: 'newsletter_campaign_status_created' }),
      db.collection('newsletterDeliveries').createIndex({ campaignId: 1, subscriberId: 1 }, { unique: true, name: 'newsletter_delivery_subscriber_unique' }),
      db.collection('newsletterDeliveries').createIndex({ campaignId: 1, status: 1, nextAttemptAt: 1, createdAt: 1 }, { name: 'newsletter_delivery_campaign_status' }),
      db.collection('newsletterDeliveries').createIndex({ resendEmailId: 1 }, { unique: true, sparse: true, name: 'newsletter_delivery_resend_email_unique' }),
      db.collection('newsletterDeliveryAttempts').createIndex({ deliveryId: 1, attemptNumber: 1 }, { unique: true, name: 'newsletter_delivery_attempt_unique' }),
      db.collection('newsletterDeliveryAttempts').createIndex({ resendEmailId: 1 }, { sparse: true, name: 'newsletter_attempt_resend_email' }),
      db.collection('newsletterTestEmails').createIndex({ id: 1 }, { unique: true, name: 'newsletter_test_id_unique' }),
      db.collection('newsletterRateLimits').createIndex({ key: 1, createdAt: -1 }, { name: 'newsletter_rate_limit_key_created' }),
      db.collection('newsletterRateLimits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0, name: 'newsletter_rate_limit_expiry' }),
    ]).catch((error) => {
      newsletterIndexesPromise = undefined;
      throw error;
    });
  }
  await newsletterIndexesPromise;
}
