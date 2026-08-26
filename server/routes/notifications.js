const express = require('express');
const router = express.Router();
const { Notification, EmailLog } = require('../db');

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { $or: [{ userId }, { userId: null }] } : {};
    const notifications = await Notification.find(filter).sort({ timestamp: -1 });
    res.json(notifications);
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { id: req.params.id },
      { read: true },
      { new: true }
    );
    res.json({ success: true, notification: notif });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// POST /api/notifications/mark-all-read
router.post('/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;
    const filter = userId ? { userId } : {};
    await Notification.updateMany(filter, { read: true });
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking all notifications read:', err);
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// GET /api/notifications/emails (Simulated Email Logs)
router.get('/emails', async (req, res) => {
  try {
    const { recipientEmail } = req.query;
    const filter = recipientEmail ? { to: new RegExp(`^${recipientEmail}$`, 'i') } : {};
    const emails = await EmailLog.find(filter).sort({ sentAt: -1 });
    res.json(emails);
  } catch (err) {
    console.error('Error fetching email logs:', err);
    res.status(500).json({ error: 'Failed to retrieve email logs' });
  }
});

module.exports = router;
