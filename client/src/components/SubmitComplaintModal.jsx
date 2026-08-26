import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  AlertTriangle,
  Check,
  MapPin,
  Tag,
  ShieldAlert,
  FileText,
  Trash2,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { complaintApi, aiApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const CATEGORIES = [
  'Wi-Fi & IT',
  'Hostel Maintenance',
  'Laboratories',
  'Classrooms',
  'Cleanliness',
  'Transportation',
  'Campus Infrastructure',
  'Library Facilities',
  'Cafeteria & Dining',
  'Other Facilities'
];

const PRIORITIES = [
  { level: 'Low', desc: 'Minor issue / non-urgent', color: 'var(--priority-low)' },
  { level: 'Medium', desc: 'Standard campus repair', color: 'var(--priority-medium)' },
  { level: 'High', desc: 'Disrupting lectures / dorms', color: 'var(--priority-high)' },
  { level: 'Critical', desc: 'Safety hazard / urgent emergency', color: 'var(--priority-critical)' }
];

const LOCATION_PRESETS = [
  'Hostel Block B, Room 302',
  'Science Block, Chemistry Lab 2',
  'Engineering Block 1, Hall 104',
  'Central Library, 2nd Floor',
  'Central Cafeteria, East Wing',
  'Main Campus Bus Stand'
];

export default function SubmitComplaintModal({ isOpen, onClose, onComplaintCreated }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Wi-Fi & IT');
  const [priority, setPriority] = useState('Medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // AI Auto-Categorize & Priority Assistant
  const handleAiCategorize = async () => {
    if (!description && !title) {
      addToast('Please enter an issue title or description first for AI detection', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiApi.categorize({ title, description });
      if (res.category) setCategory(res.category);
      if (res.priority) setPriority(res.priority);
      setAiFeedback({
        text: `AI detected category "${res.category}" and priority "${res.priority}" (${res.confidence}% confidence). Reason: ${res.reasoning}`
      });
      addToast('Category and Priority auto-detected!', 'success');
    } catch (err) {
      console.error('AI error:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // AI Duplicate Check
  const handleCheckDuplicates = async () => {
    if (!title && !description) return;
    try {
      const res = await aiApi.checkDuplicates({ title, description, location, category });
      if (res.hasPotentialDuplicates && res.matches?.length > 0) {
        setDuplicateWarning(res.matches);
      } else {
        setDuplicateWarning(null);
      }
    } catch (err) {
      console.warn('Duplicate check error:', err);
    }
  };

  // AI Summarize & Polish
  const handleAiPolish = async () => {
    if (!description) {
      addToast('Please write a rough description first to polish', 'info');
      return;
    }
    setAiLoading(true);
    try {
      const res = await aiApi.summarize({ title, description, location });
      if (res.summary) {
        setDescription(res.summary);
        addToast('Description polished and formatted!', 'success');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !category || !location.trim() || !description.trim()) {
      addToast('Please complete all required fields', 'error');
      return;
    }

    setSubmitting(true);
    try {
      let payload;
      if (selectedFile) {
        payload = new FormData();
        payload.append('title', title);
        payload.append('category', category);
        payload.append('priority', priority);
        payload.append('location', location);
        payload.append('description', description);
        payload.append('studentId', user?.id || 'usr_student_1');
        payload.append('studentName', user?.name || 'Alex Johnson');
        payload.append('studentRollNo', user?.rollNo || 'CS-2024-042');
        payload.append('studentEmail', user?.email || 'student@college.edu');
        payload.append('attachment', selectedFile);
      } else {
        payload = {
          title,
          category,
          priority,
          location,
          description,
          studentId: user?.id || 'usr_student_1',
          studentName: user?.name || 'Alex Johnson',
          studentRollNo: user?.rollNo || 'CS-2024-042',
          studentEmail: user?.email || 'student@college.edu'
        };
      }

      const created = await complaintApi.create(payload);
      addToast(`Complaint #${created.id} submitted successfully!`, 'success');
      if (onComplaintCreated) onComplaintCreated(created);
      onClose();
    } catch (err) {
      console.error('Submission failed:', err);
      addToast(err.message || 'Failed to submit complaint', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-box" style={{ width: '34px', height: '34px' }}>
              <FileText size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Report a Campus Problem</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Your ticket will be assigned to the relevant department administrator
              </p>
            </div>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* AI Assistant Banner */}
            <div className="ai-assistant-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#a855f7" />
                <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Smart AI Assistant Available
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAiCategorize}
                  disabled={aiLoading}
                  style={{ fontSize: '0.76rem', gap: '4px' }}
                >
                  <Sparkles size={13} color="#6366f1" /> Auto-Detect Category
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleAiPolish}
                  disabled={aiLoading}
                  style={{ fontSize: '0.76rem', gap: '4px' }}
                >
                  <FileText size={13} color="#a855f7" /> AI Polish
                </button>
              </div>
            </div>

            {aiFeedback && (
              <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: 'var(--radius-md)', padding: '10px 14px', fontSize: '0.8rem', color: 'var(--primary-500)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{aiFeedback.text}</span>
              </div>
            )}

            {/* Duplicate Issue Alert */}
            {duplicateWarning && duplicateWarning.length > 0 && (
              <div className="duplicate-alert">
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Similar Existing Open Tickets Detected</div>
                  <div style={{ fontSize: '0.78rem', marginTop: '2px', opacity: 0.9 }}>
                    A similar issue might already be under maintenance:
                  </div>
                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {duplicateWarning.map(dup => (
                      <div key={dup.id} style={{ fontSize: '0.76rem', background: 'rgba(0,0,0,0.2)', padding: '4px 8px', borderRadius: '4px' }}>
                        <strong>{dup.id}</strong>: {dup.title} ({dup.location}) - <span style={{ textDecoration: 'underline' }}>{dup.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Complaint Title */}
            <div className="form-group">
              <label className="form-label">
                <span>Issue Title / Subject <span style={{ color: '#ef4444' }}>*</span></span>
              </label>
              <input
                type="text"
                className="input-control"
                placeholder="e.g. Wi-Fi dropping constantly in Hostel B 3rd Floor"
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={handleCheckDuplicates}
                required
              />
            </div>

            {/* Category & Priority Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
              <div>
                <label className="form-label">
                  <span>Category <span style={{ color: '#ef4444' }}>*</span></span>
                </label>
                <select
                  className="select-control"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">
                  <span>Urgency / Priority</span>
                </label>
                <select
                  className="select-control"
                  value={priority}
                  onChange={e => setPriority(e.target.value)}
                >
                  {PRIORITIES.map(p => (
                    <option key={p.level} value={p.level}>
                      {p.level} ({p.desc})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Quick Presets */}
            <div className="form-group">
              <label className="form-label">
                <span>Campus Location / Room <span style={{ color: '#ef4444' }}>*</span></span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Specify building, floor & room</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Hostel Block B, 3rd Floor, Room 304"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  onBlur={handleCheckDuplicates}
                  required
                />
              </div>

              {/* Location Preset Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', alignSelf: 'center' }}>Quick fill:</span>
                {LOCATION_PRESETS.map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setLocation(preset)}
                    style={{
                      fontSize: '0.72rem',
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)'
                    }}
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">
                <span>Detailed Description <span style={{ color: '#ef4444' }}>*</span></span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Describe what is broken or needed</span>
              </label>
              <textarea
                className="textarea-control"
                rows={4}
                placeholder="Provide specific details about when it started, symptoms, equipment affected..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={handleCheckDuplicates}
                required
              />
            </div>

            {/* Image / Attachment Upload */}
            <div className="form-group">
              <label className="form-label">
                <span>Photo / Document Attachment (Optional)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>JPG, PNG up to 10MB</span>
              </label>
              
              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: '2px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '24px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    background: 'var(--bg-elevated)',
                    transition: 'border-color 0.2s'
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files[0]) {
                      setSelectedFile(e.dataTransfer.files[0]);
                    }
                  }}
                >
                  <UploadCloud size={28} color="var(--primary-500)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontSize: '0.88rem', fontWeight: 600 }}>Click to browse or drag & drop photo here</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Helps technicians diagnose the problem faster
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <FileText size={32} color="var(--primary-500)" />
                    )}
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedFile.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button type="button" className="btn btn-danger btn-sm" onClick={removeFile}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Submitting Ticket...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
