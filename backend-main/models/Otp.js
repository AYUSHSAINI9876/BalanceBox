// models/Otp.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    purpose: { type: String, required: true, enum: ['signup'], default: 'signup' },

    // Only an HMAC of the code is stored, so a database leak never exposes a
    // usable OTP (the pepper lives in JWT_SECRET, outside the database).
    codeHash: { type: String, required: true },

    attempts: { type: Number, default: 0 },
    lastSentAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// One live challenge per email+purpose; requesting a new code replaces the old.
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });

// MongoDB removes the document once expiresAt passes, so codes cannot linger.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Otp', otpSchema);
