import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Layers,
  LayoutGrid,
  List,
  UserCheck,
  Building,
  ArrowRight,
  TrendingUp,
  Flame,
  Star
} from 'lucide-react';
import { complaintApi, authApi } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const STAGES = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

export default function AdminDashboard({ onSelectComplaint }) {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & View State
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'kanban'
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  // Quick Assignment state
  const [assignModalData, setAssignModalData] = useState(null);
  const [assignDept, setAssignDept] = useState('');
  const [assignStaff, setAssignStaff] = useState('');
  const [assignComment, setAssignComment] = useState('');
  const [savingAssign, setSavingAssign] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const data = await complaintApi.getAll({
        search,
        status: statusFilter,
        department: departmentFilter,
        priority: priorityFilter,
        sortBy
      });
      setComplaints(data);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
    authApi.getDepartments().then(setDepartments).catch(console.warn);
  }, [search, statusFilter, departmentFilter, priorityFilter, sortBy]);

  // Handle quick department assignment
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    if (!assignDept || !assignModalData) return;

    setSavingAssign(true);
    try {
      const updated = await complaintApi.assign(assignModalData.id, {
        department: assignDept,
        staffName: assignStaff || 'Department Team',
        actorName: `${user?.name || 'Admin'} (Admin)`,
        comment: assignComment || `Assigned to ${assignDept}`
      });
      setComplaints(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      setAssignModalData(null);
      addToast(`Ticket #${updated.id} assigned to ${assignDept}`, 'success');
    } catch (err) {
      addToast('Assignment failed', 'error');
    } finally {
      setSavingAssign(false);
    }
  };

  // KPIs
  const total = complaints.length;
  const pendingReview = complaints.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const inProgress = complaints.filter(c => c.status === 'Assigned' || c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const criticalCount = complaints.filter(c => c.priority === 'Critical' && c.status !== 'Closed' && c.status !== 'Resolved').length;

  return (
    <div>
      {/* Header Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, marginBottom: '6px' }}>
            <Shield size={13} /> Administrator Command Desk
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Campus Incident & Complaint Management</h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Review incoming student complaints, assign maintenance departments, and track resolution lifecycles.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-card)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <button
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <List size={15} /> Table View
          </button>
          <button
            className={`btn btn-sm ${viewMode === 'kanban' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setViewMode('kanban')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <LayoutGrid size={15} /> Kanban Board
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Active Database</div>
            <div className="kpi-value">{total}</div>
            <div className="kpi-subtext">All campus tickets</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-title">Pending Review</div>
            <div className="kpi-value">{pendingReview}</div>
            <div className="kpi-subtext">Need staff triage</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
            <UserCheck size={24} />
          </div>
          <div>
            <div className="kpi-title">Under Active Repair</div>
            <div className="kpi-value">{inProgress}</div>
            <div className="kpi-subtext">Assigned to depts</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="kpi-title">Total Resolved</div>
            <div className="kpi-value">{resolved}</div>
            <div className="kpi-subtext">Verified & closed</div>
          </div>
        </div>

        {criticalCount > 0 && (
          <div className="kpi-card" style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}>
            <div className="kpi-icon-wrap" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e' }}>
              <Flame size={24} />
            </div>
            <div>
              <div className="kpi-title">Urgent SLA Alerts</div>
              <div className="kpi-value" style={{ color: '#f43f5e' }}>{criticalCount}</div>
              <div className="kpi-subtext">Immediate action required</div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Control Toolbar */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="input-control"
              style={{ paddingLeft: '34px', fontSize: '0.86rem' }}
              placeholder="Search ID, title, student..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <select className="select-control" style={{ fontSize: '0.86rem' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {STAGES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select className="select-control" style={{ fontSize: '0.86rem' }} value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map(d => (
              <option key={d.id} value={d.name}>{d.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select className="select-control" style={{ fontSize: '0.86rem' }} value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="all">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Sort By */}
          <select className="select-control" style={{ fontSize: '0.86rem' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="priority">Sort: Highest Priority</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Table vs Kanban */}
      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Updating complaint registry...
        </div>
      ) : complaints.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '50px 20px', textAlign: 'center' }}>
          <Shield size={44} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No matching complaints found</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.86rem' }}>
            Adjust your search keywords or filter criteria to display tickets.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* Data Table View */
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ticket ID</th>
                <th>Subject / Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Dept / Staff</th>
                <th>Reported By</th>
                <th>Date Filed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(item => (
                <tr key={item.id}>
                  <td>
                    <span className="ticket-id" style={{ cursor: 'pointer' }} onClick={() => onSelectComplaint(item.id)}>
                      {item.id}
                    </span>
                  </td>
                  <td>
                    <div
                      style={{ fontWeight: 600, maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'pointer' }}
                      onClick={() => onSelectComplaint(item.id)}
                      title={item.title}
                    >
                      {item.title}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📍 {item.location}
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{item.category}</span>
                  </td>
                  <td>
                    <span className={`priority-pill priority-${item.priority.toLowerCase()}`}>
                      {item.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    {item.assignedDepartment ? (
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.assignedDepartment}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.assignedStaff || 'Staff Team'}</div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: '0.75rem', padding: '4px 8px' }}
                        onClick={() => {
                          setAssignModalData(item);
                          setAssignDept(departments[0]?.name || '');
                        }}
                      >
                        + Assign Dept
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{item.studentName}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.studentRollNo}</div>
                  </td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onSelectComplaint(item.id)}>
                      Manage <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kanban Board View */
        <div className="kanban-grid">
          {STAGES.map(stage => {
            const stageComplaints = complaints.filter(c => c.status === stage);
            return (
              <div key={stage} className="kanban-column">
                <div className="kanban-col-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`status-pill status-${stage.toLowerCase().replace(/\s+/g, '-')}`} style={{ fontSize: '0.72rem' }}>
                      {stage}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      ({stageComplaints.length})
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {stageComplaints.length === 0 ? (
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                      No tickets in {stage}
                    </div>
                  ) : (
                    stageComplaints.map(card => (
                      <div
                        key={card.id}
                        onClick={() => onSelectComplaint(card.id)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-md)',
                          padding: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span className="ticket-id">{card.id}</span>
                          <span className={`priority-pill priority-${card.priority.toLowerCase()}`} style={{ fontSize: '0.68rem' }}>
                            {card.priority}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px', lineHeight: '1.3' }}>
                          {card.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                          📍 {card.location}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          <span>{card.assignedDepartment ? card.assignedDepartment : 'Unassigned'}</span>
                          <span>{card.studentName.split(' ')[0]}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Assign Modal */}
      {assignModalData && (
        <div className="modal-overlay" onClick={() => setAssignModalData(null)}>
          <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Assign #{assignModalData.id}</h3>
              <button className="icon-action-btn" onClick={() => setAssignModalData(null)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSaveAssignment}>
              <div className="modal-body">
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                  Assign <strong>"{assignModalData.title}"</strong> to a campus maintenance department.
                </p>

                <div className="form-group">
                  <label className="form-label">Select Department</label>
                  <select
                    className="select-control"
                    value={assignDept}
                    onChange={e => {
                      setAssignDept(e.target.value);
                      const d = departments.find(dept => dept.name === e.target.value);
                      if (d) setAssignStaff(d.lead);
                    }}
                    required
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name} (Lead: {d.lead})</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assigned Staff / Lead</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. David Vance"
                    value={assignStaff}
                    onChange={e => setAssignStaff(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Notes (Optional)</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. Dispatched for afternoon inspection"
                    value={assignComment}
                    onChange={e => setAssignComment(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAssignModalData(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={savingAssign}>
                  {savingAssign ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
