import React, { useState } from 'react';
import { X, LogIn, UserPlus, Shield, User, GraduationCap, Building } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, switchDemoRole } = useAuth();
  const { addToast } = useNotifications();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  
  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register form
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [role, setRole] = useState('student');
  const [rollNo, setRollNo] = useState('');
  const [department, setDepartment] = useState('Computer Science');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      addToast('Logged in successfully', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        name,
        email: regEmail,
        password: regPassword,
        role,
        rollNo,
        department
      });
      addToast('Account created and logged in!', 'success');
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const fillQuickDemo = (demoRole) => {
    switchDemoRole(demoRole);
    addToast(`Switched to demo ${demoRole} account`, 'success');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{ maxWidth: '480px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-icon-box" style={{ width: '32px', height: '32px' }}>
              {tab === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
            </div>
            <h3 style={{ fontSize: '1.15rem' }}>{tab === 'login' ? 'Sign In to CampusResolve' : 'Create an Account'}</h3>
          </div>
          <button className="icon-action-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Quick 1-Click Demo Login Bar */}
          <div style={{ marginBottom: '20px', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '14px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
              ⚡ 1-Click Instant Demo Login
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillQuickDemo('student')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <GraduationCap size={14} color="#38bdf8" /> Student (Alex)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillQuickDemo('admin')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Shield size={14} color="#ec4899" /> Admin (Dean)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillQuickDemo('staff')}
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Building size={14} color="#fbbf24" /> Staff (David)
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
            <button
              className={`nav-tab-btn ${tab === 'login' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', borderRadius: '0', borderBottom: tab === 'login' ? '2px solid var(--primary-500)' : 'none' }}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`nav-tab-btn ${tab === 'register' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center', borderRadius: '0', borderBottom: tab === 'register' ? '2px solid var(--primary-500)' : 'none' }}
              onClick={() => { setTab('register'); setError(''); }}
            >
              Register New
            </button>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#f87171', padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input-control"
                  placeholder="student@college.edu or admin@college.edu"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Jordan Smith"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">College Email</label>
                <input
                  type="email"
                  className="input-control"
                  placeholder="jordan@college.edu"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Account Role</label>
                <select className="select-control" value={role} onChange={e => setRole(e.target.value)}>
                  <option value="student">Student</option>
                  <option value="staff">Department Staff / Resolver</option>
                  <option value="admin">College Administrator</option>
                </select>
              </div>

              {role === 'student' && (
                <div className="form-group">
                  <label className="form-label">Student Roll No. / ID</label>
                  <input
                    type="text"
                    className="input-control"
                    placeholder="e.g. CS-2024-099"
                    value={rollNo}
                    onChange={e => setRollNo(e.target.value)}
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Department / Branch</label>
                <input
                  type="text"
                  className="input-control"
                  placeholder="e.g. Computer Science / IT / Civil"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="input-control"
                  placeholder="Create a strong password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} disabled={loading}>
                {loading ? 'Creating Account...' : 'Register Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
