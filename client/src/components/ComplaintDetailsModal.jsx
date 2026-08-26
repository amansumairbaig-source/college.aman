import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  MapPin,
  Tag,
  Shield,
  User,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Building,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { complaintApi, authApi, getAttachmentUrl } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import StarRating from './StarRating';

const STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function ComplaintDetailsModal({ complaintId, isOpen, onClose, onUpdated }) {
  const { user, isAdmin, isStaff } = useAuth();
  const { addToast } = useNotifications();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Student Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackReview, setFeedbackReview] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Admin / Staff Quick Action state
  const [adminActionOpen, setAdminActionOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [updatingAction, setUpdatingAction] = useState(false);

  const fetchComplaintDetails = async () => {
    if (!complaintId) return;
    setLoading(true);
    try {
      const data = await complaintApi.getById(complaintId);
      setComplaint(data);
      setNewStatus(data.status);
      setSelectedDept(data.assignedDepartment || '');
      setSelectedStaff(data.assignedStaff || '');
    } catch (err) {
      console.error('Failed to load complaint:', err);
      addToast('Failed to load complaint details', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && complaintId) {
      fetchComplaintDetails();
      authApi.getDepartments().then(setDepartments).catch(console.warn);
      authApi.getUsers('staff').then(setStaffUsers).catch(console.warn);
    }
  }, [isOpen, complaintId]);

  if (!isOpen) return null;

  const currentStageIndex = complaint ? STAGES.indexOf(complaint.status) : 0;

  // Handle adding a new comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const updated = await complaintApi.addComment(complaint.id, {
        author: user?.name || 'Anonymous User',
        authorRole: user?.role || 'student',
        text: commentText.trim()
      });
      setComplaint(updated);
      setCommentText('');
      addToast('Message posted', 'success');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      addToast('Failed to post message', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle submitting student resolution feedback
  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const updated = await complaintApi.submitFeedback(complaint.id, {
        rating,
        review: feedbackReview
      });
      setComplaint(updated);
      addToast('Thank you for rating our resolution service!', 'success');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      addToast('Failed to submit rating', 'error');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  // Handle Admin status and assignment changes
  const handleAdminUpdate = async () => {
    setUpdatingAction(true);
    try {
      let updated = complaint;

      // Update Department Assignment if changed
      if (selectedDept && selectedDept !== complaint.assignedDepartment) {
        const staffObj = staffUsers.find(s => s.name === selectedStaff);
        updated = await complaintApi.assign(complaint.id, {
          department: selectedDept,
          staffName: selectedStaff,
          staffEmail: staffObj?.email || '',
          actorName: `${user?.name || 'Admin'} (${user?.role || 'Admin'})`,
          comment: adminNotes
        });
      }

      // Update Status if changed
      if (newStatus && newStatus !== complaint.status) {
        updated = await complaintApi.updateStatus(complaint.id, {
          status: newStatus,
          actorName: `${user?.name || 'Admin'} (${user?.role || 'Admin'})`,
          comment: adminNotes,
          resolutionSummary: newStatus === 'Resolved' || newStatus === 'Closed' ? (resolutionSummary || adminNotes) : undefined
        });
      }

      setComplaint(updated);
      setAdminActionOpen(false);
      setAdminNotes('');
      addToast(`Complaint #${complaint.id} updated successfully!`, 'success');
      if (onUpdated) onUpdated(updated);
    } catch (err) {
      console.error(err);
      addToast(err.message || 'Failed to update complaint', 'error');
    } finally {
      setUpdatingAction(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '820px' }} onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="ticket-id" style={{ background: 'var(--bg-elevated)', padding: '4px 10px', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {complaint?.id || 'CMP-XXXX'}
            </span>
            {complaint && (
              <span className={`status-pill status-${complaint.status.toLowerCase().replace(/\s+/g, '-')}`}>
                {complaint.status}
              </span>
            )}
            {complaint && (
              <span className={`priority-pill priority-${complaint.priority.toLowerCase()}`}>
                {complaint.priority} Priority
              </span>
            )}
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading complaint details...
            </div>
          ) : !complaint ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
              Complaint not found.
            </div>
          ) : (
            <div>
              {/* Title & Metadata */}
              <h2 style={{ fontSize: '1.35rem', marginBottom: '8px' }}>{complaint.title}</h2>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Tag size={14} color="var(--primary-500)" />
                  <strong>Category:</strong> {complaint.category}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <MapPin size={14} color="#f43f5e" />
                  <strong>Location:</strong> {complaint.location}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Clock size={14} />
                  <strong>Filed:</strong> {new Date(complaint.createdAt).toLocaleString()}
                </div>
              </div>

              {/* 6-Stage Visual Timeline Stepper */}
              <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px 20px', marginBottom: '24px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  Resolution Workflow Progress (6 Stages)
                </div>
                <div className="timeline-stepper">
                  {STAGES.map((stage, idx) => {
                    const isCompleted = idx < currentStageIndex || (complaint.status === 'Closed' && idx <= currentStageIndex);
                    const isActive = idx === currentStageIndex && complaint.status !== 'Closed';
                    const timelineEntry = complaint.timeline?.find(t => t.status === stage);

                    return (
                      <div
                        key={stage}
                        className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                      >
                        <div className="step-circle">
                          {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                        </div>
                        <div className="step-label">{stage}</div>
                        {timelineEntry && (
                          <div className="step-time">
                            {new Date(timelineEntry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Admin & Staff Management Action Accordion / Panel */}
              {(isAdmin || isStaff) && (
                <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(236, 72, 153, 0.08))', border: '1px solid var(--primary-glow)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={18} color="var(--primary-500)" />
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Admin / Staff Action Panel</span>
                    </div>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setAdminActionOpen(!adminActionOpen)}
                    >
                      {adminActionOpen ? 'Hide Actions' : 'Update Status & Assignment'}
                    </button>
                  </div>

                  {adminActionOpen && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                        <div>
                          <label className="form-label">Update Workflow Status</label>
                          <select className="select-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="form-label">Assign Department</label>
                          <select className="select-control" value={selectedDept} onChange={e => setSelectedDept(e.target.value)}>
                            <option value="">-- Select Department --</option>
                            {departments.map(d => (
                              <option key={d.id} value={d.name}>{d.name} ({d.lead})</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {selectedDept && (
                        <div className="form-group">
                          <label className="form-label">Assigned Staff / Resolver Person</label>
                          <input
                            type="text"
                            className="input-control"
                            placeholder="e.g. David Vance (IT Lead) or Samuel Green"
                            value={selectedStaff}
                            onChange={e => setSelectedStaff(e.target.value)}
                          />
                        </div>
                      )}

                      {(newStatus === 'Resolved' || newStatus === 'Closed') && (
                        <div className="form-group">
                          <label className="form-label">Resolution Summary & Action Taken</label>
                          <textarea
                            className="textarea-control"
                            rows={2}
                            placeholder="Describe how the problem was repaired or resolved..."
                            value={resolutionSummary}
                            onChange={e => setResolutionSummary(e.target.value)}
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">Status Update Remarks / Notification Note</label>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="e.g. Technician dispatched with replacement part..."
                          value={adminNotes}
                          onChange={e => setAdminNotes(e.target.value)}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => setAdminActionOpen(false)}>
                          Cancel
                        </button>
                        <button className="btn btn-primary btn-sm" onClick={handleAdminUpdate} disabled={updatingAction}>
                          {updatingAction ? 'Saving...' : 'Apply Status Update'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Description & Photo Section */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.92rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Issue Description
                </h4>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', fontSize: '0.92rem', lineHeight: '1.6' }}>
                  {complaint.description}
                </div>

                {complaint.attachmentUrl && (
                  <div style={{ marginTop: '14px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                      Attached Photo / Evidence:
                    </div>
                    <div style={{ maxWidth: '360px', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
                      <img
                        src={getAttachmentUrl(complaint.attachmentUrl)}
                        alt="Attachment"
                        style={{ width: '100%', height: 'auto', display: 'block', maxHeight: '220px', objectFit: 'cover' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Assigned Staff and Reporter Card Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px', marginBottom: '24px' }}>
                {/* Reporter Card */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="brand-icon-box" style={{ width: '40px', height: '40px', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                    <User size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Reported By
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>{complaint.studentName}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Roll: {complaint.studentRollNo} • {complaint.studentEmail}
                    </div>
                  </div>
                </div>

                {/* Assigned Department Card */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="brand-icon-box" style={{ width: '40px', height: '40px', background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24' }}>
                    <Building size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                      Department Assigned
                    </div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                      {complaint.assignedDepartment || 'Pending Assignment'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {complaint.assignedStaff ? `Staff: ${complaint.assignedStaff}` : 'Awaiting admin dispatch'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Details Box (if resolved/closed) */}
              {complaint.resolutionDetails && (
                <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: 'var(--radius-md)', padding: '18px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <CheckCircle2 size={20} color="#10b981" />
                    <h4 style={{ fontSize: '1rem', color: '#10b981' }}>Official Resolution Summary</h4>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {complaint.resolutionDetails.summary}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', gap: '16px' }}>
                    <span><strong>Resolved by:</strong> {complaint.resolutionDetails.resolvedBy}</span>
                    <span><strong>Date:</strong> {new Date(complaint.resolutionDetails.resolvedAt).toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Student Rating & Feedback Section */}
              {(complaint.status === 'Resolved' || complaint.status === 'Closed') && (
                <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <Star size={18} color="#f59e0b" />
                    <h4 style={{ fontSize: '0.95rem' }}>Student Resolution Feedback</h4>
                  </div>

                  {complaint.feedback ? (
                    <div>
                      <StarRating rating={complaint.feedback.rating} readOnly={true} size={18} />
                      <div style={{ marginTop: '8px', fontSize: '0.88rem', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                        "{complaint.feedback.review}"
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Submitted {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitFeedback}>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                        How satisfied are you with how campus staff handled and resolved this complaint?
                      </p>
                      <div style={{ marginBottom: '12px' }}>
                        <StarRating rating={rating} onRatingChange={setRating} size={22} />
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <input
                          type="text"
                          className="input-control"
                          placeholder="Share optional comments on speed, quality, or courtesy..."
                          value={feedbackReview}
                          onChange={e => setFeedbackReview(e.target.value)}
                        />
                      </div>
                      <button type="submit" className="btn btn-primary btn-sm" disabled={submittingFeedback}>
                        {submittingFeedback ? 'Submitting...' : 'Submit 5-Star Rating & Close'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Discussion & Audit Stream */}
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <MessageSquare size={18} color="var(--primary-500)" />
                  <h4 style={{ fontSize: '1rem' }}>Discussion & Updates</h4>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', maxHeight: '240px', overflowY: 'auto' }}>
                  {(!complaint.comments || complaint.comments.length === 0) ? (
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                      No messages posted yet. Post a comment below to communicate with staff.
                    </div>
                  ) : (
                    complaint.comments.map(c => (
                      <div
                        key={c.id}
                        style={{
                          background: c.authorRole === 'student' ? 'var(--bg-elevated)' : 'rgba(99, 102, 241, 0.1)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '10px 14px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: c.authorRole === 'student' ? 'var(--text-primary)' : 'var(--primary-500)' }}>
                            {c.author} {c.authorRole !== 'student' && '🛡️ (Staff)'}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)' }}>{c.text}</div>
                      </div>
                    ))
                  )}
                </div>

                {/* New Comment Input Form */}
                <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="Type a message or inquiry regarding this ticket..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary" disabled={submittingComment}>
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
