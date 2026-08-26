const mongoose = require('mongoose');

const timelineEntrySchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actor: { type: String, required: true },
  comment: { type: String, default: '' }
}, { _id: false });

const commentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  author: { type: String, required: true },
  authorRole: { type: String, default: 'student' },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const resolutionDetailsSchema = new mongoose.Schema({
  resolvedBy: { type: String },
  resolvedAt: { type: Date },
  summary: { type: String },
  actionTaken: { type: String }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  rating: { type: Number, min: 1, max: 5 },
  review: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], default: 'Medium' },
  status: {
    type: String,
    enum: ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'Submitted'
  },
  location: { type: String, required: true },
  description: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentRollNo: { type: String },
  studentEmail: { type: String },
  assignedDepartment: { type: String, default: null },
  assignedStaff: { type: String, default: null },
  assignedStaffEmail: { type: String, default: null },
  attachmentUrl: { type: String, default: null },
  timeline: [timelineEntrySchema],
  comments: [commentSchema],
  resolutionDetails: { type: resolutionDetailsSchema, default: null },
  feedback: { type: feedbackSchema, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);
