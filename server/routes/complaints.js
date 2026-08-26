const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { Complaint, User, Notification, EmailLog, UPLOADS_DIR } = require('../db');

// Setup multer for file attachments
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'att-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper to record an automated notification and email
async function sendNotificationAndEmail({ userId, studentEmail, studentName, title, message, complaintId, subject, emailBody }) {
  try {
    if (userId) {
      await Notification.create({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        userId,
        title,
        message,
        complaintId,
        read: false,
        timestamp: new Date()
      });
    }

    if (studentEmail) {
      await EmailLog.create({
        id: `eml_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        to: studentEmail,
        recipientName: studentName || 'Student',
        subject: subject || `[Campus Portal] ${title}`,
        body: emailBody || message,
        sentAt: new Date(),
        complaintId
      });
    }
  } catch (err) {
    console.error('Error logging notification/email:', err);
  }
}

// GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const { search, status, category, priority, department, studentId, sortBy = 'newest' } = req.query;
    const filter = {};

    if (studentId) {
      filter.studentId = studentId;
    }

    if (status && status !== 'all') {
      filter.status = new RegExp(`^${status}$`, 'i');
    }

    if (category && category !== 'all') {
      filter.category = new RegExp(`^${category}$`, 'i');
    }

    if (priority && priority !== 'all') {
      filter.priority = new RegExp(`^${priority}$`, 'i');
    }

    if (department && department !== 'all') {
      filter.assignedDepartment = new RegExp(`^${department}$`, 'i');
    }

    if (search) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { location: { $regex: q, $options: 'i' } },
        { id: { $regex: q, $options: 'i' } },
        { studentName: { $regex: q, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const complaints = await Complaint.find(filter).sort(sortOptions);

    if (sortBy === 'priority') {
      const priorityWeight = { Critical: 4, High: 3, Medium: 2, Low: 1 };
      complaints.sort((a, b) => (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0));
    }

    res.json(complaints);
  } catch (err) {
    console.error('Error fetching complaints:', err);
    res.status(500).json({ error: 'Failed to retrieve complaints' });
  }
});

// GET /api/complaints/:id
router.get('/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json(complaint);
  } catch (err) {
    console.error('Error finding complaint:', err);
    res.status(500).json({ error: 'Failed to retrieve complaint' });
  }
});

// POST /api/complaints (Create new complaint)
router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const {
      title,
      category,
      priority = 'Medium',
      location,
      description,
      studentId,
      studentName,
      studentRollNo,
      studentEmail,
      imageUrl
    } = req.body;

    if (!title || !category || !location || !description) {
      return res.status(400).json({ error: 'Title, category, location, and description are required' });
    }

    const totalCount = await Complaint.countDocuments();
    const nextNum = 1000 + totalCount + 1;
    const complaintId = `CMP-${nextNum}`;

    let attachmentUrl = imageUrl || null;
    if (req.file) {
      attachmentUrl = `/uploads/${req.file.filename}`;
    }

    const now = new Date();

    const newComplaint = new Complaint({
      id: complaintId,
      title: title.trim(),
      category: category.trim(),
      priority: priority || 'Medium',
      status: 'Submitted',
      location: location.trim(),
      description: description.trim(),
      studentId: studentId || 'usr_student_1',
      studentName: studentName || 'Alex Johnson',
      studentRollNo: studentRollNo || 'CS-2024-042',
      studentEmail: studentEmail || 'student@college.edu',
      assignedDepartment: null,
      assignedStaff: null,
      assignedStaffEmail: null,
      createdAt: now,
      updatedAt: now,
      attachmentUrl,
      timeline: [
        {
          status: 'Submitted',
          timestamp: now,
          actor: `${studentName || 'Student'} (Student)`,
          comment: 'Complaint officially registered in the portal.'
        }
      ],
      comments: [],
      resolutionDetails: null,
      feedback: null
    });

    await newComplaint.save();

    // Notify Admins
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await sendNotificationAndEmail({
        userId: adminUser.id,
        title: `New ${priority} Priority Complaint: ${category}`,
        message: `${studentName || 'A student'} reported: "${title.trim()}" at ${location.trim()}`,
        complaintId,
        studentEmail: null
      });
    }

    // Confirmation email to student
    await sendNotificationAndEmail({
      userId: studentId,
      studentEmail: studentEmail || 'student@college.edu',
      studentName: studentName || 'Student',
      title: `Complaint Registered #${complaintId}`,
      message: `Your complaint "${title.trim()}" has been received and is waiting for administrator review.`,
      complaintId,
      subject: `[Complaint Submitted] Ticket #${complaintId} Confirmation`,
      emailBody: `Dear ${studentName || 'Student'},\n\nWe have successfully received your complaint regarding "${title.trim()}" at "${location.trim()}".\n\nTicket ID: ${complaintId}\nStatus: Submitted\nCategory: ${category}\nPriority: ${priority}\n\nYou can track the live progress directly from your student dashboard.`
    });

    res.status(201).json(newComplaint);
  } catch (err) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Server failed to save complaint' });
  }
});

// PATCH /api/complaints/:id/status (Admin/Staff updates status)
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, actorName = 'Admin', comment = '', resolutionSummary, actionTaken } = req.body;
    const validStatuses = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const now = new Date();
    complaint.status = status;
    complaint.updatedAt = now;

    // Add to timeline
    complaint.timeline.push({
      status,
      timestamp: now,
      actor: actorName,
      comment: comment || `Status transitioned to ${status}.`
    });

    // If Resolved or Closed, store resolution details
    if (status === 'Resolved' || status === 'Closed') {
      if (!complaint.resolutionDetails) {
        complaint.resolutionDetails = {
          resolvedBy: actorName,
          resolvedAt: now,
          summary: resolutionSummary || comment || 'Issue has been thoroughly resolved and verified by campus staff.',
          actionTaken: actionTaken || 'Corrective maintenance action completed.'
        };
      }
    }

    await complaint.save();

    // Notify student
    await sendNotificationAndEmail({
      userId: complaint.studentId,
      studentEmail: complaint.studentEmail,
      studentName: complaint.studentName,
      title: `Status Updated: ${complaint.id} is now ${status}`,
      message: `${actorName} updated status to "${status}". Note: ${comment || 'No extra notes provided.'}`,
      complaintId: complaint.id,
      subject: `[Status Update] ${complaint.id} is now ${status}`,
      emailBody: `Hello ${complaint.studentName},\n\nYour complaint #${complaint.id} ("${complaint.title}") has moved to status "${status}".\n\nUpdated by: ${actorName}\nNotes: ${comment || 'Maintenance update in progress'}\n\nCheck your dashboard for real-time progress details.`
    });

    res.json(complaint);
  } catch (err) {
    console.error('Error updating status:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// PATCH /api/complaints/:id/assign (Assign Department & Staff)
router.patch('/:id/assign', async (req, res) => {
  try {
    const { department, staffName, staffEmail, actorName = 'Admin', comment = '' } = req.body;

    if (!department) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const now = new Date();
    complaint.assignedDepartment = department;
    complaint.assignedStaff = staffName || null;
    complaint.assignedStaffEmail = staffEmail || null;
    complaint.updatedAt = now;

    // Auto-progress status if still 'Submitted' or 'Under Review'
    if (complaint.status === 'Submitted' || complaint.status === 'Under Review') {
      complaint.status = 'Assigned';
    }

    complaint.timeline.push({
      status: complaint.status,
      timestamp: now,
      actor: actorName,
      comment: comment || `Assigned to ${department}${staffName ? ` (Lead: ${staffName})` : ''}.`
    });

    await complaint.save();

    // Notify Student and Assigned Staff
    await sendNotificationAndEmail({
      userId: complaint.studentId,
      studentEmail: complaint.studentEmail,
      studentName: complaint.studentName,
      title: `Complaint Assigned to ${department}`,
      message: `Your complaint #${complaint.id} was assigned to ${department}${staffName ? ` (${staffName})` : ''}.`,
      complaintId: complaint.id,
      subject: `[Assignment Notice] Ticket #${complaint.id} Assigned to ${department}`,
      emailBody: `Hello ${complaint.studentName},\n\nYour ticket #${complaint.id} has been formally assigned to ${department}.\nAssigned Staff: ${staffName || 'Department Team'}\n\nOur team is reviewing the issue and will begin resolution shortly.`
    });

    res.json(complaint);
  } catch (err) {
    console.error('Error assigning complaint:', err);
    res.status(500).json({ error: 'Failed to assign complaint' });
  }
});

// PATCH /api/complaints/:id/priority (Change Priority)
router.patch('/:id/priority', async (req, res) => {
  try {
    const { priority, actorName = 'Admin' } = req.body;
    const valid = ['Low', 'Medium', 'High', 'Critical'];
    if (!priority || !valid.includes(priority)) {
      return res.status(400).json({ error: 'Invalid priority level' });
    }

    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const prev = complaint.priority;
    complaint.priority = priority;
    complaint.updatedAt = new Date();

    complaint.timeline.push({
      status: complaint.status,
      timestamp: new Date(),
      actor: actorName,
      comment: `Priority adjusted from ${prev} to ${priority}.`
    });

    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error('Error changing priority:', err);
    res.status(500).json({ error: 'Failed to update priority' });
  }
});

// POST /api/complaints/:id/comments (Discussion stream)
router.post('/:id/comments', async (req, res) => {
  try {
    const { author, authorRole = 'student', text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const newComment = {
      id: `comm_${Date.now()}`,
      author: author || 'Anonymous User',
      authorRole,
      text: text.trim(),
      timestamp: new Date()
    };

    complaint.comments.push(newComment);
    complaint.updatedAt = new Date();
    await complaint.save();

    // If author is staff/admin, notify student; if student, notify admin
    if (authorRole === 'student') {
      const admin = await User.findOne({ role: 'admin' });
      if (admin) {
        await sendNotificationAndEmail({
          userId: admin.id,
          title: `New Comment on ${complaint.id}`,
          message: `${author} added a note: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
          complaintId: complaint.id,
          studentEmail: null
        });
      }
    } else {
      await sendNotificationAndEmail({
        userId: complaint.studentId,
        studentEmail: complaint.studentEmail,
        studentName: complaint.studentName,
        title: `Staff Comment on #${complaint.id}`,
        message: `${author} replied: "${text.substring(0, 80)}${text.length > 80 ? '...' : ''}"`,
        complaintId: complaint.id,
        subject: `[Update] New message regarding ticket #${complaint.id}`,
        emailBody: `Hello ${complaint.studentName},\n\n${author} from campus maintenance posted a message on your complaint #${complaint.id}:\n\n"${text}"\n\nLog in to reply.`
      });
    }

    res.status(201).json(complaint);
  } catch (err) {
    console.error('Error adding comment:', err);
    res.status(500).json({ error: 'Failed to post comment' });
  }
});

// POST /api/complaints/:id/feedback (Student rating & review)
router.post('/:id/feedback', async (req, res) => {
  try {
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
    }

    const complaint = await Complaint.findOne({ id: req.params.id });
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' });
    }

    const now = new Date();
    complaint.feedback = {
      rating: Number(rating),
      review: review ? review.trim() : '',
      submittedAt: now
    };

    // Auto-close if in resolved status
    if (complaint.status === 'Resolved') {
      complaint.status = 'Closed';
      complaint.timeline.push({
        status: 'Closed',
        timestamp: now,
        actor: `${complaint.studentName} (Student)`,
        comment: `Student rated resolution ${rating} / 5 stars. Complaint closed.`
      });
    }

    complaint.updatedAt = now;
    await complaint.save();
    res.json(complaint);
  } catch (err) {
    console.error('Error submitting feedback:', err);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

// DELETE /api/complaints/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Complaint.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ error: 'Complaint not found' });
    }
    res.json({ message: 'Complaint deleted successfully', complaint: deleted });
  } catch (err) {
    console.error('Error deleting complaint:', err);
    res.status(500).json({ error: 'Failed to delete complaint' });
  }
});

module.exports = router;
