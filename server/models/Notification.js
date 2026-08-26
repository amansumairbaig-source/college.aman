const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, default: null },
  title: { type: String, required: true },
  message: { type: String, required: true },
  complaintId: { type: String, default: null },
  read: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);
