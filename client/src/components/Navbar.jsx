import React, { useState, useRef, useEffect } from 'react';
import {
  GraduationCap,
  Shield,
  BarChart3,
  Bell,
  Mail,
  Sun,
  Moon,
  LogOut,
  LogIn,
  User,
  Check,
  CheckCircle2,
  ChevronDown,
  Layers,
  Sparkles,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar({ activeTab, onSelectTab, onOpenAuth, onOpenEmailModal, onSelectComplaint }) {
  const { user, role, theme, toggleTheme, logout, switchDemoRole, DEMO_USERS } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const notifRef = useRef(null);
  const roleRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setRoleMenuOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div className="brand-logo" onClick={() => onSelectTab('student')}>
          <div className="brand-icon-box">
            <GraduationCap size={22} />
          </div>
          <div>
            <span>CampusResolve</span>
            <span className="brand-badge">CMS</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="nav-links">
          <button
            className={`nav-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
            onClick={() => onSelectTab('student')}
          >
            <GraduationCap size={17} /> Student Portal
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => onSelectTab('admin')}
          >
            <Shield size={17} /> Admin Desk
          </button>
          <button
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => onSelectTab('analytics')}
          >
            <BarChart3 size={17} /> Analytics & SLA
          </button>
        </div>

        {/* Right Actions */}
        <div className="nav-actions">
          {/* Quick Demo Role Switcher Dropdown */}
          <div style={{ position: 'relative' }} ref={roleRef}>
            <button
              className="role-badge-btn"
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              title="Quick Demo Role Switcher"
            >
              <span className={`role-tag-pill role-${role}`}>
                {role === 'student' ? 'Student' : (role === 'admin' ? 'Admin' : 'Staff')}
              </span>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user ? user.name.split(' ')[0] : 'Demo'}
              </span>
              <ChevronDown size={14} />
            </button>

            {roleMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '240px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                padding: '8px',
                zIndex: 60
              }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', padding: '6px 8px' }}>
                  Switch Demo Persona:
                </div>
                <div
                  style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: role === 'student' ? 'var(--bg-elevated)' : 'transparent' }}
                  onClick={() => { switchDemoRole('student'); setRoleMenuOpen(false); }}
                >
                  <GraduationCap size={16} color="#38bdf8" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Alex Johnson</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Student (CS-2024-042)</div>
                  </div>
                </div>
                <div
                  style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: role === 'admin' ? 'var(--bg-elevated)' : 'transparent' }}
                  onClick={() => { switchDemoRole('admin'); setRoleMenuOpen(false); }}
                >
                  <Shield size={16} color="#ec4899" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>Dean Martinez</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Administrator</div>
                  </div>
                </div>
                <div
                  style={{ padding: '8px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', background: role === 'staff' ? 'var(--bg-elevated)' : 'transparent' }}
                  onClick={() => { switchDemoRole('staff'); setRoleMenuOpen(false); }}
                >
                  <Building size={16} color="#fbbf24" />
                  <div>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600 }}>David Vance</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>IT & Wi-Fi Lead</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Email Simulator Button */}
          <button
            className="icon-action-btn"
            onClick={onOpenEmailModal}
            title="Simulated Email Dispatcher"
          >
            <Mail size={18} />
          </button>

          {/* Real-time Notification Center Bell */}
          <div style={{ position: 'relative' }} ref={notifRef}>
            <button
              className="icon-action-btn"
              onClick={() => setNotifOpen(!notifOpen)}
              title="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="badge-counter">{unreadCount}</span>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                width: '320px',
                maxHeight: '400px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                boxShadow: 'var(--shadow-lg)',
                zIndex: 60,
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      style={{ fontSize: '0.75rem', color: 'var(--primary-500)', fontWeight: 600 }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.complaintId && onSelectComplaint) {
                            onSelectComplaint(n.complaintId);
                            setNotifOpen(false);
                          }
                        }}
                        style={{
                          padding: '10px 14px',
                          borderBottom: '1px solid var(--border-subtle)',
                          background: n.read ? 'transparent' : 'rgba(99, 102, 241, 0.08)',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                            {n.title}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                            {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
                          {n.message}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Switcher Toggle */}
          <button
            className="icon-action-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Account / Auth Trigger */}
          {user ? (
            <div style={{ position: 'relative' }} ref={userRef}>
              <div
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: '2px solid var(--primary-500)'
                }}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={user.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  width: '200px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '8px',
                  zIndex: 60
                }}>
                  <div style={{ padding: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '6px' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'flex-start', border: 'none', color: '#ef4444' }}
                    onClick={() => { logout(); setUserMenuOpen(false); }}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="btn btn-primary btn-sm" onClick={onOpenAuth}>
              <LogIn size={15} /> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
