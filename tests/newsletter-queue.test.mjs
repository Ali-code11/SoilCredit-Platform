import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildNewsletterActivationFields,
  encryptNewsletterToken,
  getNewsletterDeliveryIdempotencyKey,
  isNewsletterSubscriberEligible,
  NEWSLETTER_COLLECTIONS,
} from '../lib/newsletter.mjs';
import {
  createNewsletterCampaign,
  processNewsletterQueueBatch,
} from '../lib/newsletter-server.js';

const tokenSecret = 'test-newsletter-token-secret-0123456789';
process.env.NEWSLETTER_TOKEN_SECRET = tokenSecret;

function clone(value) {
  return structuredClone(value);
}

function compare(left, right) {
  const a = left instanceof Date ? left.getTime() : left;
  const b = right instanceof Date ? right.getTime() : right;
  return a < b ? -1 : a > b ? 1 : 0;
}

function matches(document, query = {}) {
  return Object.entries(query).every(([key, condition]) => {
    if (key === '$or') return condition.some((part) => matches(document, part));
    const value = document[key];
    if (condition && typeof condition === 'object' && !(condition instanceof Date) && !Array.isArray(condition)) {
      return Object.entries(condition).every(([operator, expected]) => {
        if (operator === '$exists') return (value !== undefined) === expected;
        if (operator === '$in') return expected.includes(value);
        if (operator === '$nin') return !expected.includes(value);
        if (operator === '$ne') return value !== expected;
        if (operator === '$gt') return value !== undefined && compare(value, expected) > 0;
        if (operator === '$gte') return value !== undefined && compare(value, expected) >= 0;
        if (operator === '$lt') return value !== undefined && compare(value, expected) < 0;
        if (operator === '$lte') return value !== undefined && compare(value, expected) <= 0;
        return false;
      });
    }
    return value === condition;
  });
}

class MemoryCollection {
  constructor() {
    this.documents = [];
    this.nextId = 1;
    this.failNextAcceptedWrite = false;
  }

  async createIndex() {}

  async countDocuments(query = {}) {
    return this.documents.filter((document) => matches(document, query)).length;
  }

  async insertOne(document) {
    const value = clone(document);
    if (value._id === undefined) value._id = this.nextId++;
    if (this.documents.some((item) => item.id === value.id && value.id !== undefined)) {
      const error = new Error('Duplicate id');
      error.code = 11000;
      throw error;
    }
    if (value.articleId && this.documents.some((item) => item.articleId === value.articleId)) {
      const error = new Error('Duplicate article');
      error.code = 11000;
      throw error;
    }
    this.documents.push(value);
    return { insertedId: value._id };
  }

  find(query = {}, options = {}) {
    let result = this.documents.filter((document) => matches(document, query)).map(clone);
    const cursor = {
      project: (projection) => {
        const selected = Object.keys(projection).filter((key) => projection[key]);
        if (selected.length) result = result.map((document) => Object.fromEntries(selected
          .filter((key) => document[key] !== undefined)
          .map((key) => [key, document[key]])));
        return cursor;
      },
      sort: (sorting) => {
        const [[key, direction]] = Object.entries(sorting);
        result.sort((left, right) => compare(left[key], right[key]) * direction);
        return cursor;
      },
      limit: (count) => {
        result = result.slice(0, count);
        return cursor;
      },
      toArray: async () => result,
    };
    if (options.projection) cursor.project(options.projection);
    return cursor;
  }

  async findOne(query = {}) {
    const document = this.documents.find((candidate) => matches(candidate, query));
    return document ? clone(document) : null;
  }

  async updateOne(query, update, options = {}) {
    if (this.failNextAcceptedWrite && update.$set?.status === 'accepted') {
      this.failNextAcceptedWrite = false;
      throw new Error('Simulated database status update failure');
    }
    let document = this.documents.find((candidate) => matches(candidate, query));
    const inserted = !document && options.upsert;
    if (!document && !inserted) return { matchedCount: 0, modifiedCount: 0 };
    if (inserted) {
      document = Object.fromEntries(Object.entries(query).filter(([, value]) => (
        value === null || typeof value !== 'object'
      )));
      document._id = this.nextId++;
      this.documents.push(document);
    }
    const before = JSON.stringify(document);
    for (const [key, value] of Object.entries(update.$setOnInsert || {})) {
      if (inserted) document[key] = clone(value);
    }
    for (const [key, value] of Object.entries(update.$set || {})) document[key] = clone(value);
    for (const key of Object.keys(update.$unset || {})) delete document[key];
    for (const [key, value] of Object.entries(update.$inc || {})) document[key] = (document[key] || 0) + value;
    return {
      matchedCount: inserted ? 0 : 1,
      modifiedCount: inserted || before !== JSON.stringify(document) ? 1 : 0,
      upsertedCount: inserted ? 1 : 0,
    };
  }

  async updateMany(query, update) {
    let modifiedCount = 0;
    for (const document of this.documents.filter((candidate) => matches(candidate, query))) {
      await this.updateOne({ _id: document._id }, update);
      modifiedCount += 1;
    }
    return { matchedCount: modifiedCount, modifiedCount };
  }

  async bulkWrite(operations) {
    for (const operation of operations) {
      await this.updateOne(operation.updateOne.filter, operation.updateOne.update, {
        upsert: operation.updateOne.upsert,
      });
    }
  }

  async findOneAndUpdate(query, update) {
    const document = this.documents.find((candidate) => matches(candidate, query));
    if (!document) return null;
    await this.updateOne({ _id: document._id }, update);
    return clone(document);
  }

  aggregate(pipeline) {
    let values = [...this.documents];
    for (const stage of pipeline) {
      if (stage.$match) values = values.filter((document) => matches(document, stage.$match));
      if (stage.$group) {
        const grouped = new Map();
        for (const document of values) {
          const key = document[stage.$group._id.slice(1)];
          grouped.set(key, (grouped.get(key) || 0) + 1);
        }
        values = [...grouped].map(([_id, count]) => ({ _id, count }));
      }
    }
    return { toArray: async () => values };
  }
}

class MemoryDatabase {
  constructor() {
    this.collections = new Map();
  }

  collection(name) {
    if (!this.collections.has(name)) this.collections.set(name, new MemoryCollection());
    return this.collections.get(name);
  }
}

function timestamp(offsetMs = 0) {
  return new Date(Date.now() + offsetMs).toISOString();
}

function article(id, publishedAt = timestamp(-60_000)) {
  return {
    id,
    status: 'published',
    title: `Article ${id}`,
    slug: `article-${id}`,
    summary: `Summary ${id}`,
    coverImageUrl: '',
    publishedAt,
  };
}

function subscriber(id, subscribedAt, status = 'active') {
  return {
    id,
    email: `${id}@example.test`,
    status,
    subscribedAt,
    confirmedAt: subscribedAt,
    unsubscribeTokenEncrypted: encryptNewsletterToken(`unsubscribe-${id}`, tokenSecret),
  };
}

async function queueAndProcess(db, news, sendEmailImpl) {
  await createNewsletterCampaign(db, news);
  return processNewsletterQueueBatch(db, { sendEmailImpl });
}

function acceptedEmail(calls) {
  return async (message) => {
    calls.push(message);
    return { id: `resend-${calls.length}` };
  };
}

test('no published campaign means the worker sends no email', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  const result = await processNewsletterQueueBatch(db, { sendEmailImpl: acceptedEmail(calls) });
  assert.equal(result.processed, false);
  assert.equal(calls.length, 0);
});

test('a news article published before subscription confirmation is excluded', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('later-subscriber', timestamp(-30_000)),
  );
  const result = await queueAndProcess(db, article('old', timestamp(-60_000)), acceptedEmail(calls));
  assert.equal(result.status, 'sent');
  assert.equal(calls.length, 0);
});

test('a subscriber confirmed before a new article receives its notification', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('early-subscriber', timestamp(-120_000)),
  );
  const result = await queueAndProcess(db, article('new', timestamp(-60_000)), acceptedEmail(calls));
  assert.equal(result.status, 'sent');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].to, 'early-subscriber@example.test');
});

test('processing a sent article again does not send a duplicate', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  const news = article('once');
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('subscriber', timestamp(-120_000)),
  );
  await queueAndProcess(db, news, acceptedEmail(calls));
  const result = await processNewsletterQueueBatch(db, { sendEmailImpl: acceptedEmail(calls) });
  assert.equal(result.processed, false);
  assert.equal(calls.length, 1);
});

test('a separately published article creates a separate one-time notification', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  const send = acceptedEmail(calls);
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('subscriber', timestamp(-180_000)),
  );
  await queueAndProcess(db, article('first', timestamp(-120_000)), send);
  await queueAndProcess(db, article('second', timestamp(-60_000)), send);
  assert.deepEqual(calls.map(({ subject }) => subject), [
    'SoilCredit: Article first',
    'SoilCredit: Article second',
  ]);
});

test('each subscriber only receives articles published after their own confirmation', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  const subscribers = db.collection(NEWSLETTER_COLLECTIONS.subscribers);
  subscribers.documents.push(subscriber('first', timestamp(-180_000)));
  await queueAndProcess(db, article('first-news', timestamp(-120_000)), acceptedEmail(calls));
  subscribers.documents.push(subscriber('second', timestamp(-90_000)));
  await queueAndProcess(db, article('second-news', timestamp(-60_000)), acceptedEmail(calls));
  assert.deepEqual(calls.map(({ to, subject }) => [to, subject]), [
    ['first@example.test', 'SoilCredit: Article first-news'],
    ['first@example.test', 'SoilCredit: Article second-news'],
    ['second@example.test', 'SoilCredit: Article second-news'],
  ]);
});

test('unsubscribed recipients are excluded from the snapshot', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('unsubscribed', timestamp(-120_000), 'unsubscribed'),
  );
  await queueAndProcess(db, article('news'), acceptedEmail(calls));
  assert.equal(calls.length, 0);
});

test('a transient send failure is retried with the same Resend idempotency key', async () => {
  const db = new MemoryDatabase();
  const keys = [];
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('retry', timestamp(-120_000)),
  );
  const campaignResult = await createNewsletterCampaign(db, article('retry-news'));
  const failOnce = async ({ idempotencyKey }) => {
    keys.push(idempotencyKey);
    const error = new Error('Rate limited');
    error.deliveryStatus = 'rate_limited';
    throw error;
  };
  await processNewsletterQueueBatch(db, { sendEmailImpl: failOnce });
  const delivery = db.collection(NEWSLETTER_COLLECTIONS.deliveries).documents[0];
  assert.equal(delivery.status, 'pending');
  await db.collection(NEWSLETTER_COLLECTIONS.deliveries).updateOne(
    { id: delivery.id },
    { $set: { nextAttemptAt: new Date(0) } },
  );
  const success = async ({ idempotencyKey }) => {
    keys.push(idempotencyKey);
    return { id: 'resend-retried' };
  };
  await processNewsletterQueueBatch(db, { sendEmailImpl: success });
  assert.equal(db.collection(NEWSLETTER_COLLECTIONS.deliveries).documents[0].status, 'accepted');
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
  assert.equal(keys[0], getNewsletterDeliveryIdempotencyKey(
    `${campaignResult.campaign.id}:retry`,
  ));
});

test('a provider-accepted email whose database update fails is safely retried idempotently', async () => {
  const db = new MemoryDatabase();
  const keys = [];
  const deliveries = db.collection(NEWSLETTER_COLLECTIONS.deliveries);
  deliveries.failNextAcceptedWrite = true;
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('db-retry', timestamp(-120_000)),
  );
  await createNewsletterCampaign(db, article('db-retry-news'));
  const send = async ({ idempotencyKey }) => {
    keys.push(idempotencyKey);
    return { id: `resend-${keys.length}` };
  };
  await processNewsletterQueueBatch(db, { sendEmailImpl: send });
  assert.equal(deliveries.documents[0].status, 'pending');
  await deliveries.updateOne(
    { id: deliveries.documents[0].id },
    { $set: { nextAttemptAt: new Date(0) } },
  );
  await processNewsletterQueueBatch(db, { sendEmailImpl: send });
  assert.equal(deliveries.documents[0].status, 'accepted');
  assert.equal(keys.length, 2);
  assert.equal(keys[0], keys[1]);
});

test('uncertain deliveries are not resent after the provider idempotency window expires', async () => {
  const db = new MemoryDatabase();
  let sendCount = 0;
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('expired-idempotency', timestamp(-120_000)),
  );
  await createNewsletterCampaign(db, article('expired-idempotency-news'));
  const uncertainSend = async () => {
    sendCount += 1;
    const error = new Error('Provider outcome is unknown');
    error.deliveryStatus = 'uncertain';
    throw error;
  };
  await processNewsletterQueueBatch(db, { sendEmailImpl: uncertainSend });
  const delivery = db.collection(NEWSLETTER_COLLECTIONS.deliveries).documents[0];
  assert.equal(delivery.status, 'pending');
  await db.collection(NEWSLETTER_COLLECTIONS.deliveries).updateOne(
    { id: delivery.id },
    { $set: { firstAttemptAt: timestamp(-24 * 60 * 60 * 1000), nextAttemptAt: new Date(0) } },
  );
  await processNewsletterQueueBatch(db, { sendEmailImpl: uncertainSend });
  assert.equal(sendCount, 1);
  assert.equal(delivery.status, 'uncertain');
});

test('simultaneous workers cannot claim and send the same campaign twice', async () => {
  const db = new MemoryDatabase();
  const calls = [];
  db.collection(NEWSLETTER_COLLECTIONS.subscribers).documents.push(
    subscriber('concurrent', timestamp(-120_000)),
  );
  await createNewsletterCampaign(db, article('concurrent-news'));
  let markStarted;
  let finishSend;
  const sendStarted = new Promise((resolve) => { markStarted = resolve; });
  const sendPaused = new Promise((resolve) => { finishSend = resolve; });
  const send = async (message) => {
    calls.push(message);
    markStarted();
    await sendPaused;
    return { id: 'resend-concurrent' };
  };
  const firstWorker = processNewsletterQueueBatch(db, { sendEmailImpl: send });
  await sendStarted;
  await db.collection(NEWSLETTER_COLLECTIONS.campaigns).updateOne(
    {},
    { $set: { leaseUntil: new Date(0) } },
  );
  const secondResult = await processNewsletterQueueBatch(db, { sendEmailImpl: send });
  finishSend();
  const firstResult = await firstWorker;
  assert.equal(firstResult.processed, true);
  assert.equal(secondResult.processed, true);
  assert.equal(calls.length, 1);
});

test('draft articles cannot be queued and confirmation time is stored consistently', async () => {
  const db = new MemoryDatabase();
  await assert.rejects(
    createNewsletterCampaign(db, { ...article('draft'), status: 'draft' }),
    /Only a published article/,
  );
  const activation = buildNewsletterActivationFields(new Date('2026-10-16T10:00:00.000Z'));
  assert.equal(activation.subscribedAt, '2026-10-16T10:00:00.000Z');
  assert.equal(activation.confirmedAt, activation.subscribedAt);
  assert.equal(isNewsletterSubscriberEligible(
    { status: 'active', subscribedAt: '2026-10-16T10:00:00.000Z' },
    '2026-10-16T15:00:00.000Z',
    '2026-10-16T16:00:00.000Z',
  ), true);
});
