import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  Building,
  Layers,
  Sparkles,
  Award
} from 'lucide-react';
import { analyticsApi } from '../utils/api';
import StarRating from './StarRating';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await analyticsApi.get();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading comprehensive campus analytics...
      </div>
    );
  }

  const categoryEntries = Object.entries(stats.categoryStats || {});
  const totalComplaints = stats.totals.total || 1;

  return (
    <div>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(99, 102, 241, 0.2)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-500)', marginBottom: '8px' }}>
          <TrendingUp size={13} /> Real-time Analytics & SLA Metrics
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Campus Resolution Analytics</h1>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Monitor facility maintenance speed, department workload distribution, and student satisfaction scores.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-500)' }}>
            <Layers size={24} />
          </div>
          <div>
            <div className="kpi-title">Overall Volume</div>
            <div className="kpi-value">{stats.totals.total}</div>
            <div className="kpi-subtext">Complaints logged</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="kpi-title">Resolution Rate</div>
            <div className="kpi-value">{stats.totals.resolvedRate}%</div>
            <div className="kpi-subtext">{stats.totals.resolved + stats.totals.closed} completed</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa' }}>
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-title">Avg Resolution Time</div>
            <div className="kpi-value">{stats.avgResolutionHours}h</div>
            <div className="kpi-subtext">From report to resolved</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-wrap" style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24' }}>
            <Award size={24} />
          </div>
          <div>
            <div className="kpi-title">Student Satisfaction</div>
            <div className="kpi-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{stats.avgSatisfactionRating}</span>
              <Star size={18} fill="#fbbf24" color="#fbbf24" />
            </div>
            <div className="kpi-subtext">Based on student ratings</div>
          </div>
        </div>
      </div>

      {/* Analytics Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Department Workload Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <Building size={20} color="var(--primary-500)" />
            <h3 style={{ fontSize: '1.15rem' }}>Department Workload & Performance</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.departmentStats.map(dept => {
              const total = dept.total || 0;
              const rate = total > 0 ? Math.round((dept.resolved / total) * 100) : 0;

              return (
                <div key={dept.name}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{dept.name}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <strong>{dept.resolved}</strong> / {dept.total} resolved ({rate}%)
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-elevated)', height: '8px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${rate}%`,
                        background: 'linear-gradient(90deg, #6366f1, #10b981)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <BarChart3 size={20} color="#a855f7" />
            <h3 style={{ fontSize: '1.15rem' }}>Category Distribution</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {categoryEntries.map(([cat, count]) => {
              const pct = Math.round((count / totalComplaints) * 100);
              return (
                <div key={cat}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.86rem', fontWeight: 600 }}>{cat}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {count} tickets ({pct}%)
                    </span>
                  </div>
                  <div style={{ background: 'var(--bg-elevated)', height: '7px', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: 'linear-gradient(90deg, #a855f7, #ec4899)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Student Feedback Reviews */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Star size={20} color="#fbbf24" />
          <h3 style={{ fontSize: '1.15rem' }}>Recent Student Feedback & Ratings</h3>
        </div>

        {stats.recentFeedback.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
            No student ratings received yet. As complaints are resolved, ratings will appear here.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
            {stats.recentFeedback.map((fb, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ticket-id">{fb.complaintId}</span>
                  <StarRating rating={fb.rating} readOnly={true} size={15} />
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  {fb.title}
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', fontStyle: fb.review ? 'italic' : 'normal', marginBottom: '10px' }}>
                  {fb.review ? `"${fb.review}"` : 'No written comments provided.'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>By {fb.studentName}</span>
                  <span>{new Date(fb.submittedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
