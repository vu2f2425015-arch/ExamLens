import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import FeaturedDashboardCharts from '../../components/FeaturedDashboardCharts/FeaturedDashboardCharts';
import styles from './AdminDashboard.module.css';
import {
  MdPeople, MdAssignment, MdMonitor, MdCheckCircle,
  MdWarning, MdSpeed
} from 'react-icons/md';
import exams from '../../data/exams.json';

export default function AdminDashboard() {
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
          <DashboardCard title="Total Candidates" value="248"  subtitle="8 academic departments" icon={MdPeople}      color="primary"   trend="+12" trendUp />
          <DashboardCard title="Scheduled Exams"  value="5"    subtitle="2 live sessions active"   icon={MdAssignment}  color="info"      trend="+1"  trendUp />
          <DashboardCard title="Active Sessions"  value="83"  subtitle="Across 5 exam halls"     icon={MdMonitor}     color="accent"    trend="+7"  trendUp />
          <DashboardCard title="Concluded Exams" value="127" subtitle="Current academic term"   icon={MdCheckCircle} color="secondary" trend="+3"  trendUp />
          <DashboardCard title="Flags Logged"    value="24"  subtitle="7 pending review"        icon={MdWarning}     color="danger"    trend="-5"  trendUp={false} />
          <DashboardCard title="AI Confidence"   value="94.2%" subtitle="Identity verification" icon={MdSpeed}       color="primary"   trend="+2%" trendUp />
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
                {exams.map(e => (
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
                ))}
              </tbody>
            </table>
          </ChartCard>
        </div>
      </main>
    </>
  );
}
