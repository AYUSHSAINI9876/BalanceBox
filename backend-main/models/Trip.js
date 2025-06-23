const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expenses: [
      {
        description: String,
        amount: Number,
        category: { type: String, required: true },
        paidBy: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, amount: Number }],
        splitBetween: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
      }
    ],
    balanceMatrix: {
      type: [[Number]],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);
