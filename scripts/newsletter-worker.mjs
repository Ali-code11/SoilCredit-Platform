import { pathToFileURL } from 'node:url';

export async function runNewsletterWorker({
  workerUrl = process.env.NEWSLETTER_WORKER_URL,
  cronSecret = process.env.CRON_SECRET,
  fetchImpl = fetch,
} = {}) {
  if (!workerUrl) throw new Error('Set NEWSLETTER_WORKER_URL to the app worker endpoint.');
  if (!cronSecret) throw new Error('Set CRON_SECRET in the worker environment.');

  let endpoint;
  try {
    endpoint = new URL(workerUrl);
  } catch {
    throw new Error('NEWSLETTER_WORKER_URL must be a valid URL.');
  }

  const localHttp = ['localhost', '127.0.0.1', '[::1]'].includes(endpoint.hostname);
  if ((endpoint.protocol !== 'https:' && !(localHttp && endpoint.protocol === 'http:'))
    || endpoint.pathname !== '/api/newsletter/worker'
    || endpoint.username
    || endpoint.password) {
    throw new Error('NEWSLETTER_WORKER_URL must be an HTTPS URL ending in /api/newsletter/worker.');
  }

  const response = await fetchImpl(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cronSecret}`,
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(120_000),
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error(`Newsletter worker returned a non-JSON response (HTTP ${response.status}).`);
  }

  if (!response.ok || result?.ok !== true) {
    throw new Error(`Newsletter worker request failed (HTTP ${response.status}): ${result?.error || 'unexpected response'}`);
  }

  return {
    processed: result.processed === true,
    ...(typeof result.campaignId === 'string' ? { campaignId: result.campaignId } : {}),
    ...(result.snapshot ? { snapshot: result.snapshot } : {}),
    ...(typeof result.status === 'string' ? { status: result.status } : {}),
    ...(typeof result.reason === 'string' ? { reason: result.reason } : {}),
  };
}

const invokedDirectly = process.argv[1]
  && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  try {
    console.log(JSON.stringify(await runNewsletterWorker()));
  } catch (error) {
    console.error(`Newsletter worker invocation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
