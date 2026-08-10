import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from '../Admin/AIAlerts.module.css';
import { getSeverityColor, getSeverityBg, getInitials } from '../../utils/formatters';
import { MdCheck, MdVisibility, MdWarning } from 'react-icons/md';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { getAlerts, getAllStudents } from '../../services/firebaseService';

// Scoped Faculty Proctoring Alerts
export default function TeacherAlerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherAlerts() {
      try {
        const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];
        const [allAlerts, allStus] = await Promise.all([
          getAlerts(),
          getAllStudents()
        ]);

        const teacherStudentRolls = new Set(
          (allStus || [])
            .filter((s) => assignedIds.includes(s.divisionId))
            .map((s) => (s.rollNumber || s.id).toUpperCase())
        );

        // Filter alerts strictly to teacher's assigned divisions / student roster
        const filtered = (allAlerts || []).filter(
          (a) =>
            (a.studentId && teacherStudentRolls.has(a.studentId.toUpperCase())) ||
            (a.divisionId && assignedIds.includes(a.divisionId))
        );

        // Provide clean initial fallback mock alerts if zero recorded
        if (filtered.length === 0) {
          const fallback = [
            {
              id: 'tal-1',
              time: '10:14:20 AM',
              studentName: 'Arjun Sharma',
              studentId: 'CS2021001',
              alert: 'Face lost / candidate looked away',
              severity: 'warning',
              examName: 'Data Structures Mid-Term',
              resolved: false
            },
            {
              id: 'tal-2',
              time: '10:22:05 AM',
              studentName: 'Priya Mehta',
              studentId: 'CS2021002',
              alert: 'Multiple faces detected in frame',
              severity: 'danger',
              examName: 'Data Structures Mid-Term',
              resolved: true
            },
            {
              id: 'tal-3',
              time: '10:35:12 AM',
              studentName: 'Rohan Verma',
              studentId: 'CS2021003',
              alert: 'Browser tab switch detected',
              severity: 'warning',
              examName: 'Data Structures Mid-Term',
              resolved: false
            }
          ];
          setAlerts(fallback);
        } else {
          setAlerts(filtered);
        }
      } catch (e) {
        console.error('Failed to load teacher alerts:', e);
      } finally {
        setLoading(false);
      }
    }

    loadTeacherAlerts();
  }, [user]);

  const filteredAlerts = alerts.filter(
    (a) => severityFilter === 'all' || a.severity === severityFilter
  );

  const resolveAlert = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, resolved: true } : a))
    );
  };

  return (
    <>
      <Navbar title="Cohort AI Alerts" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Proctoring Anomaly Telemetry</h1>
            <p className="page-subtitle">
              Live proctoring alerts and integrity violation events scoped to your assigned divisions.
            </p>
          </div>
          <div className={styles.statBadges}>
            <span className="badge badge-danger">
              {alerts.filter((a) => a.severity === 'critical' || a.severity === 'danger').length} High Risk
            </span>
            <span className="badge badge-warning">
              {alerts.filter((a) => a.severity === 'warning').length} Caution
            </span>
            <span className="badge badge-accent">
              {alerts.filter((a) => a.resolved).length} Resolved
            </span>
          </div>
        </div>

        {/* Severity Filter Buttons */}
        <div className={styles.filterRow}>
          {['all', 'warning', 'danger', 'critical'].map((f) => (
            <button
              key={f}
              className={`${styles.fBtn} ${severityFilter === f ? styles.fActive : ''}`}
              onClick={() => setSeverityFilter(f)}
              style={
                severityFilter === f && f !== 'all'
                  ? {
                      background: getSeverityBg(f),
                      color: getSeverityColor(f),
                      borderColor: getSeverityColor(f),
                    }
                  : {}
              }
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Alerts Table */}
        <div className={styles.tableWrap}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Candidate</th>
                <th>Anomaly Flag</th>
                <th>Severity</th>
                <th>Exam Paper</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading division alerts...
                  </td>
                </tr>
              ) : filteredAlerts.length > 0 ? (
                filteredAlerts.map((a, i) => (
                  <motion.tr
                    key={a.id || i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    style={{ borderLeft: `3px solid ${getSeverityColor(a.severity)}` }}
                  >
                    <td>
                      <code className={styles.time}>{a.time}</code>
                    </td>
                    <td>
                      <div className={styles.studentCell}>
                        <div className={styles.avatar}>
                          {getInitials(a.studentName || 'Student')}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                            {a.studentName}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                            {a.studentId}
                          </div>
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
                        style={{
                          background: getSeverityBg(a.severity),
                          color: getSeverityColor(a.severity),
                          borderColor: getSeverityColor(a.severity),
                        }}
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
                        <button className="btn btn-ghost btn-sm btn-icon" title="View Details">
                          <MdVisibility />
                        </button>
                        {!a.resolved && (
                          <button
                            className="btn btn-accent btn-sm btn-icon"
                            title="Resolve Flag"
                            onClick={() => resolveAlert(a.id)}
                          >
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
                    No proctoring anomaly alerts recorded for your assigned cohorts.
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
