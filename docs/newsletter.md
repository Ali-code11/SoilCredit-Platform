# Newsletter operations

Newsletter subscriptions and campaigns use the existing MongoDB connection and server-side Resend integration. Newsletter collections and indexes are created lazily by the first newsletter request or worker run. The MongoDB application user must be allowed to create indexes.

## Server environment

Configure these values in the server environment only:

- `MONGO_URL` and, if applicable, `DB_NAME` for MongoDB Atlas.
- `RESEND_API_KEY` for server-side Resend requests.
- `EMAIL_FROM` as a sender identity verified by Resend. The application fallback is `SoilCredit <no-reply@soilcredit.net>`.
- `NEWSLETTER_TOKEN_SECRET` as a stable, randomly generated secret of at least 32 characters. It encrypts unsubscribe tokens stored for campaign delivery; changing it makes existing encrypted tokens unreadable.
- `APP_URL` or `NEXT_PUBLIC_APP_URL` as the canonical site origin used for confirmation and unsubscribe links. The production fallback is `https://soilcredit.net`.
- `CRON_SECRET` as a strong secret for authenticating the persistent queue worker.
- `RESEND_WEBHOOK_SECRET` if Resend delivery-event tracking is enabled.

Do not put secrets in client-exposed variables, source control, or logs. Keep the token-encryption secret stable and back it up securely.

## Queue worker

Configure a hosting-platform cron or external scheduler to send an authenticated `POST` request to `/api/newsletter/worker` at least once per minute:

```text
Authorization: Bearer <CRON_SECRET>
```

### Render Cron Job

Create a **Cron Job** in the Render Dashboard using the same repository and branch as the web service:

1. Set the build command to `npm ci`.
2. Set the schedule to `* * * * *` (once per minute).
3. Set the run command to `node scripts/newsletter-worker.mjs`.
4. Add `NEWSLETTER_WORKER_URL` as the public URL of the web service, ending exactly in `/api/newsletter/worker` (for example, `https://<your-service>.onrender.com/api/newsletter/worker`).
5. Add `CRON_SECRET` to both the web service and the Cron Job as the same strong, private value. Do not place the secret in the URL, command, or source control.

The cron service only needs these two environment variables; the web service retains the MongoDB and Resend settings. A Cron Job is separate from the web service, so running `npm run start` or the web service by itself does not schedule newsletter processing. Check the Cron Job's **Runs** logs for a processed batch or `No queued campaigns.` and a successful exit status.

For a manual invocation, run `node scripts/newsletter-worker.mjs` with those same two environment variables. Each invocation claims one campaign batch. The MongoDB lease prevents concurrent workers from processing the same campaign batch.

Each invocation snapshots up to 250 eligible recipients and sends at most five messages. The queue and per-recipient states persist in MongoDB, so the worker can resume in later invocations; larger lists take multiple runs. Publishing an article does not enqueue a campaign. An administrator must preview and explicitly confirm it in `/admin/newsletter`.

## Resend delivery events

To track actual delivery outcomes, configure a Resend webhook for:

```text
https://soilcredit.net/api/newsletter/webhook
```

Set its signing secret as `RESEND_WEBHOOK_SECRET`. The handler verifies Svix signatures and maps supported Resend delivery events to the associated recipient record. Without the webhook, recipients remain `accepted` after Resend accepts the request; this does not mean inbox delivery was verified.

## Safe local verification

1. Configure the server environment and restart the application.
2. Sign in using an existing MongoDB user whose `role` is `admin`; no public admin registration is provided.
3. Use a controlled inbox to subscribe, then confirm from the received link.
4. Preview a published article and send a test message only to an explicitly selected controlled address.
5. Verify a campaign only with a specifically authorized test audience, then invoke the worker with the configured secret.
6. Check campaign and per-recipient states in the admin panel and verify delivery outcomes from the Resend webhook when configured.

The legacy `newsletter` collection is not imported: its records do not establish double-opt-in consent.

Subscription requests are throttled per email address and per client IP. Existing active subscriptions and pending subscriptions still inside the confirmation resend cooldown do not consume the per-IP allowance.

**Production safety:** starting the worker processes campaigns already queued in that database and can send to all confirmed active subscribers in their recipient snapshots. Test locally against a separate staging database and controlled recipient first. Do not manually trigger the production worker merely as a health check.
