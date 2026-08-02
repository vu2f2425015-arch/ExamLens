import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import styles from './AdminDashboard.module.css';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import {
  MdPeople, MdAssignment, MdMonitor, MdCheckCircle,
  MdWarning, MdSpeed
} from 'react-icons/md';
import exams from '../../data/exams.json';

const attendanceData = [
  { day: 'Mon', present: 38, absent: 7 },
  { day: 'Tue', present: 42, absent: 3 },
  { day: 'Wed', present: 35, absent: 10 },
  { day: 'Thu', present: 45, absent: 0 },
  { day: 'Fri', present: 40, absent: 5 },
  { day: 'Sat', present: 28, absent: 17 },
];

const examStatsData = [
  { name: 'DSA',    avg: 76, highest: 95, lowest: 42 },
  { name: 'DBMS',   avg: 81, highest: 98, lowest: 55 },
  { name: 'OS',     avg: 72, highest: 92, lowest: 38 },
  { name: 'CN',     avg: 69, highest: 89, lowest: 31 },
  { name: 'ML',     avg: 84, highest: 99, lowest: 61 },
];

const alertsData = [
  { time: '10am', alerts: 3 },
  { time: '11am', alerts: 7 },
  { time: '12pm', alerts: 5 },
  { time: '1pm',  alerts: 12 },
  { time: '2pm',  alerts: 9 },
  { time: '3pm',  alerts: 4 },
];

const scoreDistData = [
  { name: '90-100', value: 8,  color: '#2A6B49' },
  { name: '80-89',  value: 15, color: '#1E2B37' },
  { name: '70-79',  value: 12, color: '#2D3E4F' },
  { name: '60-69',  value: 7,  color: '#C88A2D' },
  { name: 'Below',  value: 3,  color: '#A62B2B' },
];

const customTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #D9D7CE',
  borderRadius: '4px',
  color: '#0F2042',
  fontSize: '0.8rem',
  fontFamily: 'IBM Plex Mono, monospace',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};

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

        {/* Charts Row 1 */}
        <div className={`${styles.chartsRow} grid-2`} style={{ marginTop: '1.5rem' }}>
          <ChartCard title="Candidate Attendance Ledger" subtitle="Weekly candidate participation">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E1" />
                <XAxis dataKey="day" tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#5C6A79', fontFamily: 'IBM Plex Sans' }} />
                <Bar dataKey="present" fill="#1E2B37" radius={[2,2,0,0]} name="Present Candidates" />
                <Bar dataKey="absent"  fill="#A62B2B" radius={[2,2,0,0]} name="Absent Candidates" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Proctoring Anomaly Stream" subtitle="Flagged event density today">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={alertsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E1" />
                <XAxis dataKey="time" tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Area type="monotone" dataKey="alerts" stroke="#A62B2B" fill="#FDF2F2" strokeWidth={2} name="Anomaly Flags" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Charts Row 2 */}
        <div className={`${styles.chartsRow} grid-2`} style={{ marginTop: '1rem' }}>
          <ChartCard title="Examination Performance Matrix" subtitle="Score distribution across core modules">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={examStatsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E1" />
                <XAxis dataKey="name" tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip contentStyle={customTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#5C6A79', fontFamily: 'IBM Plex Sans' }} />
                <Line type="monotone" dataKey="avg"     stroke="#1E2B37" strokeWidth={2} dot={{ fill: '#1E2B37', r: 4 }} name="Term Average" />
                <Line type="monotone" dataKey="highest" stroke="#2A6B49" strokeWidth={2} dot={{ fill: '#2A6B49', r: 4 }} name="Highest Mark" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="lowest"  stroke="#A62B2B" strokeWidth={2} dot={{ fill: '#A62B2B', r: 4 }} name="Lowest Mark" strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Grade Distribution Breakdown" subtitle="Term grade brackets">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                    {scoreDistData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={customTooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {scoreDistData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-body)', flex: 1, fontFamily: 'IBM Plex Mono' }}>{d.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-ink)', fontWeight: 600, fontFamily: 'IBM Plex Mono' }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

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
