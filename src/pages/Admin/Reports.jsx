import Navbar from '../../components/Navbar/Navbar';
import ChartCard from '../../components/ChartCard/ChartCard';
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { MdDownload, MdBarChart } from 'react-icons/md';
import DashboardCard from '../../components/DashboardCard/DashboardCard';

const attendanceData = [
  { exam: 'DSA',  appeared: 40, absent: 5 },
  { exam: 'DBMS', appeared: 35, absent: 3 },
  { exam: 'OS',   appeared: 38, absent: 4 },
  { exam: 'CN',   appeared: 37, absent: 3 },
  { exam: 'ML',   appeared: 32, absent: 3 },
];

const scoreData = [
  { range: '<40', count: 3 },
  { range: '40-50', count: 5 },
  { range: '50-60', count: 8 },
  { range: '60-70', count: 12 },
  { range: '70-80', count: 18 },
  { range: '80-90', count: 15 },
  { range: '90+',   count: 7 },
];

const violationData = [
  { name: 'Face Lost',     value: 45, color: '#F59E0B' },
  { name: 'Tab Switch',    value: 23, color: '#F97316' },
  { name: 'Multi Faces',   value: 12, color: '#EF4444' },
  { name: 'Phone Detect',  value: 8,  color: '#DC2626' },
  { name: 'Noise',         value: 30, color: '#6C63FF' },
];

const tooltipStyle = { backgroundColor: '#1E293B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', color: '#F1F5F9', fontSize: '0.8rem' };

export default function Reports() {
  return (
    <>
      <Navbar title="Reports" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Comprehensive examination data and AI analysis</p>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <MdDownload /> Export PDF
          </button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <DashboardCard title="Avg Score"    value="78%"  icon={MdBarChart} color="primary"   index={0} />
          <DashboardCard title="Pass Rate"    value="91%"  icon={MdBarChart} color="accent"    index={1} />
          <DashboardCard title="Total Violations" value="118" icon={MdBarChart} color="warning" index={2} />
          <DashboardCard title="Exams Done"   value="5"    icon={MdBarChart} color="secondary" index={3} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <ChartCard title="Attendance Report" subtitle="Appeared vs Absent by exam">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="exam" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#94A3B8' }} />
                <Bar dataKey="appeared" fill="#6C63FF" radius={[4,4,0,0]} name="Appeared" />
                <Bar dataKey="absent"   fill="#EF4444" radius={[4,4,0,0]} name="Absent" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="AI Violation Types" subtitle="By category">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <ResponsiveContainer width="55%" height={220}>
                <PieChart>
                  <Pie data={violationData} cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={3} dataKey="value">
                    {violationData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {violationData.map(d => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', flex: 1 }}>{d.name}</span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600 }}>{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        <ChartCard title="Score Distribution" subtitle="Number of students per score range">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={scoreData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="range" tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748B', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="count" fill="#22C55E" radius={[4,4,0,0]} name="Students" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </main>
    </>
  );
}
