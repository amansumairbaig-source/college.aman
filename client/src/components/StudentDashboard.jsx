import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  FileQuestion,
  MapPin,
  Tag,
  ArrowUpRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { complaintApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard({ onOpenSubmit, onSelectComplaint }) {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      // Pass studentId to retrieve this student's tickets
      const data = await complaintApi.getAll({
        studentId: user?.id,
        search,
        status: statusFilter,
        category: categoryFilter
      });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to fetch student complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user, search, statusFilter, categoryFilter]);

  // Derived statistics
  const total = complaints.length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned' || c.status === 'Under Review').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const pendingRatingCount = complaints.filter(c => c.status === 'Resolved' && !c.feedback).length;

  const categories = [
    'All Categories',
    'Wi-Fi & IT',
    'Hostel Maintenance',
    'Laboratories',
    'Classrooms',
    'Cleanliness',
    'Transportation',
    'Campus Infrastructure',
    'Library Facilities',
    'Cafeteria & Dining'
  ];

  return (
    <div>
      {/* Student Welcome Hero */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.12) 100%)',
        border: '1px solid var(--primary-glow)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-500)', marginBottom: '8px' }}>
            <Sparkles size={13} /> Digital Campus Care
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>
            Welcome, {user?.name || 'Student'} 👋
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            Track campus issues, connect directly with maintenance staff, and rate resolutions.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onOpenSubmit} style={{ padding: '12px 22px', fontSize: '0.95rem' }}>
          <Plus size={18} /> Report New Issue
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)' }}>
            <FileQuestion size={24} />
          </div>
          <div>
            <div className="kpi-title">My Total Tickets</div>
            <div className="kpi-value">{total}</div>
            <div className="kpi-subtext">Registered on portal</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-title">In Progress / Assigned</div>
            <div className="kpi-value">{inProgressCount}</div>
            <div className="kpi-subtext">Under active repair</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="kpi-title">Resolved & Closed</div>
            <div className="kpi-value">{resolvedCount}</div>
            <div className="kpi-subtext">Successfully fixed</div>
          </div>
        </div>

        {pendingRatingCount > 0 && (
          <div className="kpi-card" style={{ borderColor: 'rgba(251, 191, 36, 0.4)' }}>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <div className="kpi-title">Awaiting Your Rating</div>
              <div className="kpi-value" style={{ color: '#fbbf24' }}>{pendingRatingCount}</div>
              <div className="kpi-subtext">Please rate service</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        {/* Status Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
          {[
            { id: 'all', label: 'All' },
            { id: 'Submitted', label: 'Submitted' },
            { id: 'In Progress', label: 'In Progress' },
            { id: 'Resolved', label: 'Resolved' },
            { id: 'Closed', label: 'Closed' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: statusFilter === tab.id ? '#fff' : 'var(--text-secondary)',
                background: statusFilter === tab.id ? 'var(--primary-500)' : 'transparent',
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div style={{ display: 'flex', gap: '10px', flex: '1 1 320px', maxWidth: '500px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by ticket ID, location, title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="select-control"
            style={{ width: '160px' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat === 'All Categories' ? 'all' : cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Complaints List View */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your tickets...
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '50px 20px', textAlign: 'center' }}>
          <FileQuestion size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No complaints found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem', maxWidth: '400px', margin: '0 auto 16px' }}>
            {search || statusFilter !== 'all' || categoryFilter !== 'all'
              ? 'Try clearing the filters or search keywords.'
              : 'Everything looks good! Report an issue if you notice anything broken around campus.'}
          </p>
          <button className="btn btn-primary btn-sm" onClick={onOpenSubmit}>
            <Plus size={16} /> File First Complaint
          </button>
        </div>
      ) : (
        <div>
          {complaints.map(item => (
            <div
              key={item.id}
              className={`complaint-card ${item.priority.toLowerCase()}`}
              onClick={() => onSelectComplaint(item.id)}
            >
              <div className="card-header-row">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span className="ticket-id">{item.id}</span>
                  <span className={`status-pill status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                    {item.status}
                  </span>
                  <span className={`priority-pill priority-${item.priority.toLowerCase()}`}>
                    {item.priority}
                  </span>
                </div>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={12} /> {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="card-title">{item.title}</div>
              <div className="card-description">{item.description}</div>

              <div className="card-meta-row">
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div className="meta-item">
                    <Tag size={14} color="var(--primary-500)" />
                    <span>{item.category}</span>
                  </div>
                  <div className="meta-item">
                    <MapPin size={14} color="#f43f5e" />
                    <span>{item.location}</span>
                  </div>
                  {item.assignedDepartment && (
                    <div className="meta-item" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                      <span>Dept: {item.assignedDepartment}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-500)', fontSize: '0.82rem', fontWeight: 600 }}>
                  View Progress & Details <ArrowUpRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
