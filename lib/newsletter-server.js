import { randomUUID } from 'node:crypto';
import { sendEmail } from '@/lib/email';
import { ensureNewsletterIndexes, getDb } from '@/lib/mongodb';
import {
  NEWSLETTER_COLLECTIONS,
  buildNewsletterEmail,
  decryptNewsletterToken,
  getCampaignStatus,
  getWebhookDeliveryStatus,
} from '@/lib/newsletter.mjs';

const SNAPSHOT_BATCH_SIZE = 250;
const DELIVERY_BATCH_SIZE = 5;
const CAMPAIGN_LEASE_MS = 90 * 1000;
const STALE_DELIVERY_MS = 3 * 60 * 1000;

function getOrigin() {
  const configured = (process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://soilcredit.net').trim();
  return /^https?:\/\//i.test(configured) ? configured.replace(/\/$/, '') : `https://${configured.replace(/\/$/, '')}`;
}

export function getArticleUrl(slug) {
  return `https://soilcredit.net/news/${encodeURIComponent(slug)}`;
}

export function buildCampaignPreview(article, unsubscribeUrl = 'https://soilcredit.net/newsletter/unsubscribe') {
  return buildNewsletterEmail({
    article,
    articleUrl: getArticleUrl(article.slug),
    unsubscribeUrl,
    publishedAt: article.publishedAt,
  });
}

function serializeCampaign(campaign, counts = {}) {
  return {
    id: campaign.id,
    articleId: campaign.articleId,
    articleTitle: campaign.article?.title || '',
    articleSlug: campaign.article?.slug || '',
    status: campaign.status,
    recipientCount: campaign.recipientCount || 0,
    acceptedCount: counts.accepted || 0,
    deliveredCount: counts.delivered || 0,
    failedCount: counts.failed || 0,
    pendingCount: counts.pending || 0,
    skippedCount: counts.skipped_unsubscribed || 0,
    createdAt: campaign.createdAt,
    completedAt: campaign.completedAt || null,
  };
}

export async function getCampaignCounts(db, campaignId) {
  const rows = await db.collection(NEWSLETTER_COLLECTIONS.deliveries).aggregate([
    { $match: { campaignId } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]).toArray();
  return rows.reduce((counts, row) => {
    counts[row._id] = row.count;
    return counts;
  }, {});
}

export async function getNewsletterAdminOverview(db) {
  const subscribers = db.collection(NEWSLETTER_COLLECTIONS.subscribers);
  const campaigns = db.collection(NEWSLETTER_COLLECTIONS.campaigns);
  const [active, pending, unsubscribed, history] = await Promise.all([
    subscribers.countDocuments({ status: 'active' }),
    subscribers.countDocuments({ status: 'pending' }),
    subscribers.countDocuments({ status: 'unsubscribed' }),
    campaigns.find({})
      .project({ _id: 0, id: 1, articleId: 1, article: 1, status: 1, recipientCount: 1, createdAt: 1, completedAt: 1 })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray(),
  ]);

  const results = await Promise.all(history.map(async (campaign) => ({
    campaign: serializeCampaign(campaign, await getCampaignCounts(db, campaign.id)),
  })));

  return {
    subscribers: { active, pending, unsubscribed, total: active + pending + unsubscribed },
    campaigns: results.map(({ campaign }) => campaign),
  };
}

export async function createNewsletterCampaign(db, article) {
  const campaigns = db.collection(NEWSLETTER_COLLECTIONS.campaigns);
  const existing = await campaigns.findOne({ articleId: article.id });
  if (existing) {
    return { campaign: serializeCampaign(existing, await getCampaignCounts(db, existing.id)), created: false };
  }

  const recipientCount = await db.collection(NEWSLETTER_COLLECTIONS.subscribers).countDocuments({ status: 'active' });
  if (!recipientCount) throw new Error('There are no confirmed active subscribers eligible for this campaign.');

  const now = new Date();
  const campaign = {
    id: randomUUID(),
    articleId: article.id,
    article: {
      title: article.title,
      slug: article.slug,
      summary: article.summary,
      coverImageUrl: article.coverImageUrl || '',
      publishedAt: article.publishedAt,
    },
    status: 'snapshotting',
    recipientCount,
    recipientsAsOf: now.toISOString(),
    snapshotCursor: null,
    snapshotComplete: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  try {
    await campaigns.insertOne(campaign);
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const concurrentCampaign = await campaigns.findOne({ articleId: article.id });
    if (!concurrentCampaign) throw error;
    return { campaign: serializeCampaign(concurrentCampaign, await getCampaignCounts(db, concurrentCampaign.id)), created: false };
  }

  return { campaign: serializeCampaign(campaign), created: true };
}

export async function sendNewsletterTest({ article, email, requestId }) {
  const db = await getDb();
  await ensureNewsletterIndexes(db);
  const tests = db.collection(NEWSLETTER_COLLECTIONS.tests);
  const existing = await tests.findOne({ id: requestId });
  if (existing) return { status: existing.status, accepted: existing.status === 'accepted', duplicate: true };

  const test = {
    id: requestId,
    articleId: article.id,
    email,
    status: 'sending',
    createdAt: new Date().toISOString(),
  };
  try {
    await tests.insertOne(test);
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const repeated = await tests.findOne({ id: requestId });
    return { status: repeated?.status || 'sending', accepted: repeated?.status === 'accepted', duplicate: true };
  }

  try {
    const message = buildNewsletterEmail({
      article,
      articleUrl: getArticleUrl(article.slug),
      unsubscribeUrl: `${getOrigin()}/newsletter/unsubscribe`,
      preview: true,
      publishedAt: article.publishedAt,
    });
    const response = await sendEmail({
      to: email,
      subject: message.subject,
      html: message.html,
      text: message.text,
      idempotencyKey: `newsletter-test-${requestId}`,
    });
    await tests.updateOne({ id: requestId }, {
      $set: { status: 'accepted', resendEmailId: response?.id || null, acceptedAt: new Date().toISOString() },
    });
    return { status: 'accepted', accepted: true, duplicate: false };
  } catch (error) {
    await tests.updateOne({ id: requestId }, { $set: { status: 'failed', failedAt: new Date().toISOString() } });
    throw error;
  }
}

async function claimCampaign(db) {
  const now = new Date();
  return db.collection(NEWSLETTER_COLLECTIONS.campaigns).findOneAndUpdate(
    {
      status: { $in: ['snapshotting', 'queued', 'processing'] },
      $or: [{ leaseUntil: { $exists: false } }, { leaseUntil: { $lte: now } }],
    },
    {
      $set: {
        status: 'processing',
        leaseUntil: new Date(now.getTime() + CAMPAIGN_LEASE_MS),
        updatedAt: now.toISOString(),
      },
    },
    { sort: { createdAt: 1 }, returnDocument: 'after', includeResultMetadata: false },
  );
}

async function snapshotRecipients(db, campaign) {
  const query = {
    status: 'active',
    createdAt: { $lte: campaign.recipientsAsOf },
    confirmedAt: { $lte: campaign.recipientsAsOf },
    ...(campaign.snapshotCursor ? { _id: { $gt: campaign.snapshotCursor } } : {}),
  };
  const recipients = await db.collection(NEWSLETTER_COLLECTIONS.subscribers)
    .find(query, { projection: { _id: 1, id: 1, email: 1 } })
    .sort({ _id: 1 })
    .limit(SNAPSHOT_BATCH_SIZE)
    .toArray();

  if (recipients.length) {
    await db.collection(NEWSLETTER_COLLECTIONS.deliveries).bulkWrite(recipients.map((subscriber) => ({
      updateOne: {
        filter: { campaignId: campaign.id, subscriberId: subscriber.id },
        update: {
          $setOnInsert: {
            id: `${campaign.id}:${subscriber.id}`,
            campaignId: campaign.id,
            subscriberId: subscriber.id,
            email: subscriber.email,
            status: 'pending',
            attemptCount: 0,
            createdAt: campaign.createdAt,
            updatedAt: campaign.createdAt,
          },
        },
        upsert: true,
      },
    })), { ordered: false });
  }

  const lastRecipient = recipients.at(-1);
  const complete = recipients.length < SNAPSHOT_BATCH_SIZE;
  await db.collection(NEWSLETTER_COLLECTIONS.campaigns).updateOne(
    { id: campaign.id },
    {
      $set: {
        ...(lastRecipient ? { snapshotCursor: lastRecipient._id } : {}),
        snapshotComplete: complete,
        status: complete ? 'processing' : 'snapshotting',
        updatedAt: new Date().toISOString(),
      },
    },
  );

  return { snapshotCount: recipients.length, snapshotComplete: complete };
}

async function recoverStaleDeliveries(db, campaignId) {
  const staleAt = new Date(Date.now() - STALE_DELIVERY_MS);
  const stale = await db.collection(NEWSLETTER_COLLECTIONS.deliveries).find({
    campaignId,
    status: 'sending',
    updatedAt: { $lte: staleAt.toISOString() },
  }, { projection: { id: 1, attemptCount: 1 } }).toArray();

  for (const delivery of stale) {
    const updatedAt = new Date().toISOString();
    await db.collection(NEWSLETTER_COLLECTIONS.deliveries).updateOne(
      { id: delivery.id, status: 'sending', updatedAt: { $lte: staleAt.toISOString() } },
      { $set: { status: 'uncertain', updatedAt } },
    );
    await db.collection(NEWSLETTER_COLLECTIONS.attempts).updateOne(
      { deliveryId: delivery.id, attemptNumber: delivery.attemptCount, status: 'sending' },
      { $set: { status: 'uncertain', finishedAt: updatedAt } },
    );
  }
}

async function deliverPendingBatch(db, campaign) {
  const deliveries = db.collection(NEWSLETTER_COLLECTIONS.deliveries);
  const pending = await deliveries.find({
    campaignId: campaign.id,
    status: 'pending',
    $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: { $lte: new Date() } }],
  })
    .sort({ createdAt: 1 })
    .limit(DELIVERY_BATCH_SIZE)
    .toArray();

  for (const delivery of pending) {
    const startedAt = new Date().toISOString();
    const claimed = await deliveries.updateOne(
      {
        id: delivery.id,
        status: 'pending',
        $or: [{ nextAttemptAt: { $exists: false } }, { nextAttemptAt: { $lte: new Date() } }],
      },
      { $set: { status: 'sending', updatedAt: startedAt }, $inc: { attemptCount: 1 } },
    );
    if (!claimed.modifiedCount) continue;

    const attemptNumber = delivery.attemptCount + 1;
    const attemptId = `${delivery.id}:${attemptNumber}`;
    await db.collection(NEWSLETTER_COLLECTIONS.attempts).insertOne({
      id: attemptId,
      campaignId: campaign.id,
      deliveryId: delivery.id,
      attemptNumber,
      status: 'sending',
      startedAt,
    });

    let providerAccepted = false;
    try {
      const subscriber = await db.collection(NEWSLETTER_COLLECTIONS.subscribers).findOne(
        { id: delivery.subscriberId },
        { projection: { status: 1, unsubscribeTokenEncrypted: 1 } },
      );
      if (!subscriber || subscriber.status !== 'active') {
        const finishedAt = new Date().toISOString();
        await deliveries.updateOne({ id: delivery.id, status: 'sending' }, {
          $set: { status: 'skipped_unsubscribed', updatedAt: finishedAt },
        });
        await db.collection(NEWSLETTER_COLLECTIONS.attempts).updateOne({ id: attemptId }, {
          $set: { status: 'skipped_unsubscribed', finishedAt },
        });
        continue;
      }

      const token = decryptNewsletterToken(subscriber.unsubscribeTokenEncrypted);
      const unsubscribeUrl = `${getOrigin()}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
      const oneClickUnsubscribeUrl = `${getOrigin()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;
      const article = { ...campaign.article, publishedAt: campaign.article.publishedAt };
      const message = buildNewsletterEmail({
        article,
        articleUrl: getArticleUrl(article.slug),
        unsubscribeUrl,
        publishedAt: article.publishedAt,
      });
      const response = await sendEmail({
        to: delivery.email,
        subject: message.subject,
        html: message.html,
        text: message.text,
        headers: {
          'List-Unsubscribe': `<${oneClickUnsubscribeUrl}>, <mailto:unsubscribe@soilcredit.net?subject=unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        },
        idempotencyKey: `newsletter-${attemptId}`,
      });

      providerAccepted = true;
      const acceptedAt = new Date().toISOString();
      await deliveries.updateOne({ id: delivery.id, status: 'sending' }, {
        $set: {
          status: 'accepted',
          ...(response?.id ? { resendEmailId: response.id } : {}),
          acceptedAt,
          updatedAt: acceptedAt,
        },
      });
      await db.collection(NEWSLETTER_COLLECTIONS.attempts).updateOne({ id: attemptId }, {
        $set: { status: 'accepted', ...(response?.id ? { resendEmailId: response.id } : {}), finishedAt: acceptedAt },
      });
    } catch (error) {
      const failedAt = new Date().toISOString();
      const rateLimited = error.deliveryStatus === 'rate_limited' && attemptNumber < 8;
      const deliveryStatus = providerAccepted || error.deliveryStatus === 'uncertain'
        ? 'uncertain'
        : rateLimited
          ? 'pending'
          : 'failed';
      const retryDelayMs = Math.min(15 * 60 * 1000, 60 * 1000 * (2 ** Math.min(attemptNumber - 1, 4)));
      await deliveries.updateOne({ id: delivery.id, status: 'sending' }, {
        $set: {
          status: deliveryStatus,
          updatedAt: failedAt,
          ...(rateLimited ? { nextAttemptAt: new Date(Date.now() + retryDelayMs) } : {}),
        },
      });
      await db.collection(NEWSLETTER_COLLECTIONS.attempts).updateOne({ id: attemptId }, {
        $set: {
          status: rateLimited ? 'rate_limited' : deliveryStatus,
          error: String(error.message || 'Email delivery failed').slice(0, 500),
          finishedAt: failedAt,
        },
      });
    }
  }
}

export async function processNewsletterQueueBatch(db) {
  await ensureNewsletterIndexes(db);
  const campaign = await claimCampaign(db);
  if (!campaign) return { processed: false, reason: 'No queued campaigns.' };

  try {
    await recoverStaleDeliveries(db, campaign.id);
    let snapshot = { snapshotCount: 0, snapshotComplete: campaign.snapshotComplete };
    if (!campaign.snapshotComplete) snapshot = await snapshotRecipients(db, campaign);

    if (snapshot.snapshotComplete) await deliverPendingBatch(db, campaign);

    const counts = await getCampaignCounts(db, campaign.id);
    const pending = counts.pending || 0;
    const processing = counts.sending || 0;
    const failures = (counts.failed || 0) + (counts.bounced || 0) + (counts.complained || 0) + (counts.uncertain || 0);
    const status = getCampaignStatus({
      snapshotComplete: snapshot.snapshotComplete,
      pending,
      processing,
      accepted: counts.accepted || 0,
      delivered: counts.delivered || 0,
      failures,
    });
    const finished = ['sent', 'partially_failed', 'failed'].includes(status);
    const updatedAt = new Date().toISOString();
    await db.collection(NEWSLETTER_COLLECTIONS.campaigns).updateOne(
      { id: campaign.id },
      {
        $set: {
          status,
          recipientCount: snapshot.snapshotComplete ? Object.values(counts).reduce((total, count) => total + count, 0) : campaign.recipientCount,
          acceptedCount: counts.accepted || 0,
          deliveredCount: counts.delivered || 0,
          failedCount: failures,
          pendingCount: pending,
          updatedAt,
          ...(finished ? { completedAt: updatedAt } : {}),
        },
        $unset: { leaseUntil: '' },
      },
    );

    return { processed: true, campaignId: campaign.id, snapshot, status };
  } catch (error) {
    await db.collection(NEWSLETTER_COLLECTIONS.campaigns).updateOne(
      { id: campaign.id },
      { $set: { status: 'queued', lastWorkerError: String(error.message || 'Queue processing failed').slice(0, 500), updatedAt: new Date().toISOString() }, $unset: { leaseUntil: '' } },
    );
    throw error;
  }
}

export async function retryNewsletterCampaign(db, campaignId) {
  const campaigns = db.collection(NEWSLETTER_COLLECTIONS.campaigns);
  const campaign = await campaigns.findOne({ id: campaignId });
  if (!campaign) return null;

  const result = await db.collection(NEWSLETTER_COLLECTIONS.deliveries).updateMany(
    { campaignId, status: 'failed' },
    { $set: { status: 'pending', updatedAt: new Date().toISOString() }, $unset: { lastError: '' } },
  );
  if (result.modifiedCount) {
    await campaigns.updateOne({ id: campaignId }, {
      $set: { status: 'queued', updatedAt: new Date().toISOString() },
      $unset: { completedAt: '', leaseUntil: '' },
    });
  }
  return { campaign: serializeCampaign(await campaigns.findOne({ id: campaignId }), await getCampaignCounts(db, campaignId)), retryCount: result.modifiedCount };
}

export async function handleNewsletterWebhook(db, event, eventId) {
  const nextStatus = event?.type && getWebhookDeliveryStatus(event.type);
  const emailId = event?.data?.email_id;
  if (!nextStatus || typeof emailId !== 'string') return { processed: false };

  const events = db.collection(NEWSLETTER_COLLECTIONS.webhookEvents);
  await events.updateOne(
    { _id: eventId },
    { $setOnInsert: { eventType: event.type, status: 'processing', createdAt: new Date().toISOString() } },
    { upsert: true },
  );
  const delivery = await db.collection(NEWSLETTER_COLLECTIONS.deliveries).findOne({ resendEmailId: emailId });
  if (!delivery) {
    await events.updateOne({ _id: eventId }, { $set: { status: 'ignored', processedAt: new Date().toISOString() } });
    return { processed: false };
  }

  const terminal = ['delivered', 'bounced', 'complained', 'failed', 'uncertain', 'skipped_unsubscribed'];
  const filter = nextStatus === 'accepted'
    ? { id: delivery.id, status: { $nin: terminal } }
    : { id: delivery.id, status: { $in: ['accepted', 'delivered'] } };
  await db.collection(NEWSLETTER_COLLECTIONS.deliveries).updateOne(filter, {
    $set: { status: nextStatus, updatedAt: new Date().toISOString(), [`${nextStatus}At`]: new Date().toISOString() },
  });
  await db.collection(NEWSLETTER_COLLECTIONS.attempts).updateOne(
    { resendEmailId: emailId },
    { $set: { status: nextStatus, webhookUpdatedAt: new Date().toISOString() } },
  );
  const counts = await getCampaignCounts(db, delivery.campaignId);
  const pending = counts.pending || 0;
  const processing = counts.sending || 0;
  const failures = (counts.failed || 0) + (counts.bounced || 0) + (counts.complained || 0) + (counts.uncertain || 0);
  const campaign = await db.collection(NEWSLETTER_COLLECTIONS.campaigns).findOne({ id: delivery.campaignId });
  const status = getCampaignStatus({
    snapshotComplete: campaign?.snapshotComplete,
    pending,
    processing,
    accepted: counts.accepted || 0,
    delivered: counts.delivered || 0,
    failures,
  });
  await db.collection(NEWSLETTER_COLLECTIONS.campaigns).updateOne(
    { id: delivery.campaignId },
    { $set: { status, acceptedCount: counts.accepted || 0, deliveredCount: counts.delivered || 0, failedCount: failures, updatedAt: new Date().toISOString() } },
  );
  await events.updateOne({ _id: eventId }, { $set: { status: 'processed', processedAt: new Date().toISOString() } });
  return { processed: true };
}
