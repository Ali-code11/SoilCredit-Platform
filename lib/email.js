import { Resend } from 'resend';

export async function sendEmail({ to, subject, html, text, headers, idempotencyKey }) {
  if (!process.env.RESEND_API_KEY) {
    const error = new Error('Email service is not configured. Set RESEND_API_KEY and restart the server.');
    error.deliveryStatus = 'failed';
    throw error;
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  let response;
  try {
    response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'SoilCredit <no-reply@soilcredit.net>',
      to,
      subject,
      html,
      ...(text ? { text } : {}),
      ...(headers ? { headers } : {}),
    }, idempotencyKey ? { idempotencyKey } : undefined);
  } catch (cause) {
    const error = new Error(cause.message || 'Email provider request outcome is unknown.');
    error.deliveryStatus = 'uncertain';
    throw error;
  }
  if (response.error) {
    const error = new Error(response.error.message || 'Email could not be sent.');
    error.statusCode = response.error.statusCode;
    error.deliveryStatus = response.error.statusCode === 429
      ? 'rate_limited'
      : response.error.statusCode && response.error.statusCode >= 400 && response.error.statusCode < 500
        ? 'failed'
        : 'uncertain';
    throw error;
  }
  return response.data;
}
