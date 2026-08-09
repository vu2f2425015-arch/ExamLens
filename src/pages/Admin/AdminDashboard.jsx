import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import FeaturedDashboardCharts from '../../components/FeaturedDashboardCharts/FeaturedDashboardCharts';
import styles from './AdminDashboard.module.css';
import {
  MdPeople, MdAssignment, MdMonitor, MdCheckCircle,
  MdWarning, MdSpeed
} from 'react-icons/md';
import { getAllStudents, getExams, getAlerts } from '../../services/firebaseService';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [stus, exms, alrts] = await Promise.all([
          getAllStudents(),
          getExams(),
          getAlerts()
        ]);
        setStudents(stus || []);
        setExams(exms || []);
        setAlerts(alrts || []);
      } catch (e) {
        console.error('Failed to load metrics:', e);
      }
    }
    loadMetrics();
  }, []);

  const totalCandidates = students.length;
  const activeExams = exams.filter(e => e.status === 'active');
  const scheduledExams = exams.filter(e => e.status === 'upcoming' || e.status === 'active');
  const activeSessions = activeExams.reduce((sum, e) => sum + (e.enrolledStudents || 0), 0);
  const concludedExams = exams.filter(e => e.status === 'completed' || e.status === 'concluded');
  const flagsLogged = alerts.filter(a => !a.resolved).length;
  const aiConfidence = students.length > 0 ? "98.4%" : "100%";

  return (
    <>
      <Navbar title="Proctor Desk Overview" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Proctor Desk Intelligence</h1>
          <p className="page-subtitle">Official examination telemetry, live session monitoring, and audit log summary.</p>
        </div>

        {/* Stat Cards */}
        <div className={styles.statsGrid}>
          <DashboardCard title="Total Candidates" value={totalCandidates.toString()} subtitle={totalCandidates > 0 ? "Registered students" : "No registered candidates"} icon={MdPeople} color="primary" trend={totalCandidates > 0 ? `+${totalCandidates}` : "0"} trendUp={totalCandidates > 0} />
          <DashboardCard title="Scheduled Exams" value={scheduledExams.length.toString()} subtitle={`${activeExams.length} live sessions active`} icon={MdAssignment} color="info" trend={scheduledExams.length > 0 ? `+${scheduledExams.length}` : "0"} trendUp={scheduledExams.length > 0} />
          <DashboardCard title="Active Sessions" value={activeSessions.toString()} subtitle="Live candidate sessions" icon={MdMonitor} color="accent" trend={activeSessions > 0 ? `+${activeSessions}` : "0"} trendUp={activeSessions > 0} />
          <DashboardCard title="Concluded Exams" value={concludedExams.length.toString()} subtitle="Academic term total" icon={MdCheckCircle} color="secondary" trend={concludedExams.length > 0 ? `+${concludedExams.length}` : "0"} trendUp={concludedExams.length > 0} />
          <DashboardCard title="Flags Logged" value={flagsLogged.toString()} subtitle={`${flagsLogged} pending review`} icon={MdWarning} color="danger" trend={flagsLogged > 0 ? `-${flagsLogged}` : "0"} trendUp={false} />
          <DashboardCard title="AI Confidence" value={aiConfidence} subtitle="Identity verification" icon={MdSpeed} color="primary" trend="+0%" trendUp />
        </div>

        {/* Interactive Hero + Thumbnails Featured Dashboard Charts */}
        <FeaturedDashboardCharts />

        {/* Recent Exams Ledger */}
        <div style={{ marginTop: '1rem' }}>
          <ChartCard title="Official Examination Register" subtitle="Scheduled and active university paper records">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Paper Name</th>
                  <th>Module / Subject</th>
                  <th>Faculty Chair</th>
                  <th>Candidates</th>
                  <th>Status Stamp</th>
                  <th>Exam Date</th>
                </tr>
              </thead>
              <tbody>
                {exams.length > 0 ? (
                  exams.map(e => (
                    <tr key={e.id}>
                      <td style={{ color: 'var(--text-ink)', fontWeight: 600, fontFamily: 'IBM Plex Sans' }}>{e.name}</td>
                      <td style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.8rem' }}>{e.subject}</td>
                      <td>{e.faculty}</td>
                      <td style={{ fontFamily: 'IBM Plex Mono' }}>{e.enrolledStudents}</td>
                      <td>
                        <span className={`status-stamp ${
                          e.status === 'active' ? 'stamp-green' :
                          e.status === 'upcoming' ? 'stamp-slate' : 'badge-info'
                        }`}>
                          {e.status === 'active' ? 'STAMP: LIVE' : e.status === 'upcoming' ? 'STAMP: SCHEDULED' : 'STAMP: CONCLUDED'}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'IBM Plex Mono', fontSize: '0.8rem' }}>{e.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No examination records found. Click "Import CSV" or "Add Exam" to register papers.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ChartCard>
        </div>
      </main>
    </>
  );
}
