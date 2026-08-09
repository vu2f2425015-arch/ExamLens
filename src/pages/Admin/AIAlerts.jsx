import Navbar from '../../components/Navbar/Navbar';
import styles from './AIAlerts.module.css';
import { getSeverityColor, getSeverityBg } from '../../utils/formatters';
import { useState, useEffect } from 'react';
import { MdCheck, MdVisibility, MdFilterList, MdWarning } from 'react-icons/md';
import { motion } from 'framer-motion';
import { getAlerts } from '../../services/firebaseService';

export default function AIAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    async function loadAlerts() {
      try {
        const data = await getAlerts();
        setAlerts(data || []);
      } catch (e) {
        console.error('Failed to load alerts:', e);
      }
    }
    loadAlerts();
  }, []);

  const filtered = alerts.filter(a => severityFilter === 'all' || a.severity === severityFilter);

  const resolve = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true } : a));
  };

  return (
    <>
      <Navbar title="AI Alerts" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">AI Alerts</h1>
            <p className="page-subtitle">Real-time proctoring violations and suspicious activities</p>
          </div>
          <div className={styles.statBadges}>
            <span className="badge badge-danger">{alerts.filter(a=>a.severity==='critical').length} Critical</span>
            <span className="badge badge-warning">{alerts.filter(a=>a.severity==='warning').length} Warning</span>
            <span className="badge badge-accent">{alerts.filter(a=>a.resolved).length} Resolved</span>
          </div>
        </div>

        {/* Filter */}
        <div className={styles.filterRow}>
          {['all','low','warning','danger','critical'].map(f => (
            <button
              key={f}
              className={`${styles.fBtn} ${severityFilter === f ? styles.fActive : ''}`}
              onClick={() => setSeverityFilter(f)}
              style={severityFilter === f && f !== 'all' ? { background: getSeverityBg(f), color: getSeverityColor(f), borderColor: getSeverityColor(f) } : {}}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Student</th>
                <th>Alert</th>
                <th>Severity</th>
                <th>Exam</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((a, i) => (
                  <motion.tr
                    key={a.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderLeft: `3px solid ${getSeverityColor(a.severity)}` }}
                  >
                    <td><code className={styles.time}>{a.time}</code></td>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>{(a.studentName || 'ST').split(' ').map(n=>n[0]).join('').slice(0,2)}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{a.studentName}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.studentId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className={styles.alertText} style={{ color: getSeverityColor(a.severity) }}>
                        <MdWarning />
                        {a.alert}
                      </div>
                    </td>
                    <td>
                      <span
                        className={styles.severityPill}
                        style={{ background: getSeverityBg(a.severity), color: getSeverityColor(a.severity), borderColor: getSeverityColor(a.severity) }}
                      >
                        {(a.severity || 'info').toUpperCase()}
                      </span>
                    </td>
                    <td>{a.examName}</td>
                    <td>
                      <span className={`badge ${a.resolved ? 'badge-accent' : 'badge-warning'}`}>
                        {a.resolved ? 'Resolved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="View">
                          <MdVisibility />
                        </button>
                        {!a.resolved && (
                          <button className="btn btn-accent btn-sm btn-icon" title="Resolve" onClick={() => resolve(a.id)}>
                            <MdCheck />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No proctoring alerts recorded. Platform is clear.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
