const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

// IPv6 clients get a whole address range, so the raw address must be collapsed
// to its /64 subnet before being used as a key — otherwise a single user can
// rotate addresses to bypass the limit.
const clientKey = (req) => ipKeyGenerator(req.ip);
const emailKey = (req) => String(req.body?.email || '').trim().toLowerCase();

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

// Keyed by email as well as IP so one address cannot be spammed with codes
// from many IPs, and one IP cannot enumerate many addresses.
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => `${clientKey(req)}:${emailKey(req)}`,
  message: { message: 'Too many verification codes requested. Please try again later.' },
});

const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => `${clientKey(req)}:${emailKey(req)}`,
  message: { message: 'Too many verification attempts. Please try again later.' },
});

module.exports = { generalLimiter, authLimiter, otpRequestLimiter, otpVerifyLimiter };
