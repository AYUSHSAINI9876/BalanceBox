// services/mailer.js
const sgMail = require('@sendgrid/mail');
const { otpEmail } = require('./emailTemplates');

const APP_NAME = process.env.APP_NAME || 'BalanceBox';
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;
const FROM_NAME = process.env.SENDGRID_FROM_NAME || APP_NAME;
const API_KEY = process.env.SENDGRID_API_KEY;

const isConfigured = Boolean(API_KEY && FROM_EMAIL);
if (isConfigured) sgMail.setApiKey(API_KEY);

function assertUsable() {
  if (isConfigured) return;
  if (process.env.NODE_ENV === 'production') {
    // Failing loudly beats silently accepting signups nobody can complete.
    throw new Error('Email is not configured: set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL');
  }
}

/**
 * Sends the signup verification code.
 *
 * When SendGrid is not configured this throws in production, but in development
 * it logs the code to the server console so the flow can be exercised locally
 * without an API key. The code is never returned to the HTTP client.
 */
async function sendOtpEmail(to, code, minutes) {
  const { subject, html, text } = otpEmail({ code, minutes, appName: APP_NAME });

  if (!isConfigured) {
    assertUsable();
    console.log(
      `\n[dev] SendGrid not configured — OTP for ${to} is ${code} (expires in ${minutes}m)\n`
    );
    return { delivered: false, devFallback: true };
  }

  try {
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
      // Verification codes must never be rewritten into tracking redirects.
      trackingSettings: {
        clickTracking: { enable: false, enableText: false },
        openTracking: { enable: false },
      },
    });
    return { delivered: true, devFallback: false };
  } catch (err) {
    const detail = err?.response?.body?.errors?.[0]?.message || err.message;
    console.error('SendGrid send failed:', detail);
    const e = new Error('Could not send the verification email. Please try again.');
    e.statusCode = 502;
    throw e;
  }
}

module.exports = { sendOtpEmail, isEmailConfigured: () => isConfigured, APP_NAME };
