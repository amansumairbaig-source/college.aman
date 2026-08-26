const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  to: { type: String, required: true },
  recipientName: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  sentAt: { type: Date, default: Date.now },
  complaintId: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
