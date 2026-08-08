// controllers/otpController.js
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../services/mailer');

const OTP_LENGTH = 6;
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);
const RESEND_COOLDOWN_SECONDS = Number(process.env.OTP_RESEND_COOLDOWN_SECONDS || 60);
const MAX_ATTEMPTS = 5;
const SIGNUP_TOKEN_TTL = '20m';

function generateCode() {
  // crypto.randomInt is uniform, unlike Math.random() * range.
  return String(crypto.randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, '0');
}

// Peppered with JWT_SECRET so leaked OTP rows cannot be brute-forced offline.
function hashCode(code) {
  return crypto.createHmac('sha256', process.env.JWT_SECRET).update(code).digest('hex');
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

/**
 * POST /api/users/send-otp   { email }
 * Creates (or replaces) the signup challenge for an email and mails the code.
 */
exports.sendOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    const existingUser = await User.findOne({ email }).select('_id').lean();
    if (existingUser) {
      return res.status(409).json({
        message: 'That email already has an account. Try logging in instead.',
        code: 'EMAIL_TAKEN',
      });
    }

    const existing = await Otp.findOne({ email, purpose: 'signup' });
    if (existing) {
      const elapsedMs = Date.now() - new Date(existing.lastSentAt).getTime();
      const waitMs = RESEND_COOLDOWN_SECONDS * 1000 - elapsedMs;
      if (waitMs > 0) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code.`,
          retryAfterSeconds: Math.ceil(waitMs / 1000),
        });
      }
    }

    const code = generateCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

    // Send before persisting: if SendGrid rejects, no challenge is left behind.
    await sendOtpEmail(email, code, OTP_TTL_MINUTES);

    await Otp.findOneAndUpdate(
      { email, purpose: 'signup' },
      { email, purpose: 'signup', codeHash: hashCode(code), attempts: 0, lastSentAt: new Date(), expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      message: 'Verification code sent. Check your inbox.',
      expiresInMinutes: OTP_TTL_MINUTES,
      resendAfterSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({ message: error.message });
  }
};

/**
 * POST /api/users/verify-otp   { email, otp }
 * On success returns a short-lived signup token proving ownership of the email.
 */
exports.verifyOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = String(req.body.otp || '').trim();

    const record = await Otp.findOne({ email, purpose: 'signup' });
    if (!record) {
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    }

    if (record.expiresAt.getTime() < Date.now()) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: 'That code has expired. Request a new one.' });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteOne({ _id: record._id });
      return res.status(429).json({ message: 'Too many incorrect attempts. Request a new code.' });
    }

    const provided = hashCode(otp);
    const expected = record.codeHash;
    const match =
      provided.length === expected.length &&
      crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(expected));

    if (!match) {
      record.attempts += 1;
      await record.save();
      const left = Math.max(MAX_ATTEMPTS - record.attempts, 0);
      return res.status(400).json({
        message: left > 0
          ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} remaining.`
          : 'Incorrect code. Request a new one.',
        attemptsRemaining: left,
      });
    }

    // Consume the challenge so a code can never be replayed.
    await Otp.deleteOne({ _id: record._id });

    const signupToken = jwt.sign(
      { email, purpose: 'signup' },
      process.env.JWT_SECRET,
      { expiresIn: SIGNUP_TOKEN_TTL }
    );

    return res.status(200).json({ message: 'Email verified.', signupToken });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Shared by the register controller: unwraps and validates the signup token.
exports.consumeSignupToken = (token) => {
  const payload = jwt.verify(token, process.env.JWT_SECRET);
  if (payload.purpose !== 'signup' || !payload.email) {
    throw new Error('Invalid signup token');
  }
  return payload.email;
};
