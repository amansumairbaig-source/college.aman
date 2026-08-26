import React, { useEffect, useState } from 'react';
import { Mail, X, RefreshCw, Send, CheckCircle2, Clock } from 'lucide-react';
import { notificationApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EmailSimulatorModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      // If admin, show all emails; if student, show user emails
      const filterEmail = user?.role === 'admin' ? null : user?.email;
      const data = await notificationApi.getEmails(filterEmail);
      setEmails(data);
      if (data.length > 0 && !selectedEmail) {
        setSelectedEmail(data[0]);
      }
    } catch (err) {
      console.error('Failed to load email logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              <Mail size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Simulated Email Dispatcher</h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Live automated campus notification emails sent to students & staff
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="icon-action-btn" onClick={fetchEmails} title="Refresh emails">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
            <button className="icon-action-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: '0', display: 'grid', gridTemplateColumns: '320px 1fr', minHeight: '440px' }}>
          {/* Email List Sidebar */}
          <div style={{ borderRight: '1px solid var(--border-subtle)', maxHeight: '480px', overflowY: 'auto' }}>
            {emails.length === 0 ? (
              <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No emails dispatched yet.
              </div>
            ) : (
              emails.map((email) => {
                const isSelected = selectedEmail?.id === email.id;
                return (
                  <div
                    key={email.id}
                    onClick={() => setSelectedEmail(email)}
                    style={{
                      padding: '14px 16px',
                      borderBottom: '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-elevated)' : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-500)' }}>
                        To: {email.to}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {email.subject}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>
                      {email.body}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Email Viewer */}
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)' }}>
            {selectedEmail ? (
              <div>
                <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span className="status-pill status-resolved" style={{ fontSize: '0.7rem' }}>
                      <CheckCircle2 size={12} /> Delivered
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(selectedEmail.sentAt).toLocaleString()}
                    </span>
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>{selectedEmail.subject}</h4>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>From:</strong> campus-notifications@college.edu &lt;College Portal System&gt;
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    <strong>To:</strong> {selectedEmail.recipientName} &lt;{selectedEmail.to}&gt;
                  </div>
                  {selectedEmail.complaintId && (
                    <div style={{ marginTop: '6px' }}>
                      <span className="ticket-id" style={{ background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: '4px' }}>
                        Ref Ticket: {selectedEmail.complaintId}
                      </span>
                    </div>
                  )}
                </div>

                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '20px',
                  whiteSpace: 'pre-line',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: 'var(--text-primary)'
                }}>
                  {selectedEmail.body}
                </div>

                <div style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                  This is an automated transmission simulated by the College Complaint Management System.
                </div>
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--text-muted)' }}>
                Select an email from the left sidebar to view contents.
              </div>
            )}
          </div>
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
