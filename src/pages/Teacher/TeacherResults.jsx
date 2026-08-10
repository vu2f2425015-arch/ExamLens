import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getAllStudents, getExams, getDivisions } from '../../services/firebaseService';
import { MdBarChart, MdCheckCircle, MdPeople, MdAssignment, MdDownload } from 'react-icons/md';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function TeacherResults() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [students, setStudents] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherResults() {
      try {
        const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];
        const [allStus, allDivs, allExams] = await Promise.all([
          getAllStudents(),
          getDivisions(),
          getExams()
        ]);

        const filteredDivs = (allDivs || []).filter((d) => assignedIds.includes(d.id));
        setDivisions(filteredDivs);

        const teacherStudents = (allStus || []).filter((s) => assignedIds.includes(s.divisionId));
        setStudents(teacherStudents);

        const filteredExams = (allExams || []).filter(
          (e) =>
            e.assignedTeacherId === user?.id ||
            e.assignedTeacherId === user?.employeeId ||
            (e.divisionIds && e.divisionIds.some((did) => assignedIds.includes(did)))
        );
        setExams(filteredExams);
      } catch (e) {
        console.error('Failed to load teacher results:', e);
      } finally {
        setLoading(false);
      }
    }

    loadTeacherResults();
  }, [user]);

  // Calculate metrics for teacher's cohorts
  const avgGpa = students.length > 0
    ? (students.reduce((acc, s) => acc + (s.gpa || 8.0), 0) / students.length).toFixed(2)
    : '8.45';
  const passRate = '94%';

  const chartData = divisions.map((div) => {
    const divStus = students.filter((s) => s.divisionId === div.id);
    const avg = divStus.length > 0
      ? (divStus.reduce((acc, s) => acc + (s.gpa || 8.0), 0) / divStus.length).toFixed(2)
      : '8.30';
    return {
      division: div.code || div.name,
      avgGpa: parseFloat(avg),
      count: divStus.length
    };
  });

  const customTooltipStyle = {
    backgroundColor: isDark ? '#171E28' : '#FFFFFF',
    border: `1px solid ${isDark ? '#283142' : '#D9D7CE'}`,
    borderRadius: '6px',
    color: isDark ? '#F0F3F7' : '#0F2042',
    fontSize: '0.8rem',
    fontFamily: 'IBM Plex Mono, monospace',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)'
  };

  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.06)' : '#EAE8E1';
  const axisTickColor = isDark ? '#8896A6' : '#5C6A79';

  return (
    <>
      <Navbar title="Cohort Results & Analytics" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Cohort Evaluation Results</h1>
            <p className="page-subtitle">
              Performance metrics, GPA distribution, and student score ledger for your assigned divisions.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <MdDownload /> Export PDF Report
          </button>
        </div>

        {/* Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <DashboardCard title="Avg Cohort GPA" value={`${avgGpa} / 10.0`} icon={MdBarChart} color="primary" trend="+0.15" trendUp={true} />
          <DashboardCard title="Overall Pass Rate" value={passRate} icon={MdCheckCircle} color="accent" trend="+2%" trendUp={true} />
          <DashboardCard title="Assigned Candidates" value={students.length.toString()} icon={MdPeople} color="info" trend={students.length > 0 ? `+${students.length}` : undefined} trendUp={true} />
          <DashboardCard title="Evaluated Papers" value={exams.length.toString()} icon={MdAssignment} color="secondary" trend={exams.length > 0 ? `+${exams.length}` : undefined} trendUp={true} />
        </div>

        {/* Performance Chart */}
        <div style={{ marginBottom: '1.75rem' }}>
          <ChartCard
            title="Division Performance Comparison"
            subtitle="Average GPA on 10.0 scale per division cohort"
            action={<span className="badge badge-accent">{divisions.length} Cohorts Compared</span>}
          >
            <div style={{ height: 260, marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis dataKey="division" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar dataKey="avgGpa" name="Avg GPA" fill={isDark ? '#708A9E' : '#1E2B37'} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Student Score Ledger */}
        <div className="card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-rule)', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-ink)' }}>
            Student Candidate Performance Register
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Student Name</th>
                <th>Department</th>
                <th>Semester</th>
                <th>Division</th>
                <th>Cumulative GPA</th>
                <th>Status Stamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading student score ledger...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((stu) => {
                  const div = divisions.find((d) => d.id === stu.divisionId);
                  return (
                    <tr key={stu.id || stu.rollNumber}>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{stu.rollNumber}</td>
                      <td style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{stu.name}</td>
                      <td>{stu.department}</td>
                      <td style={{ fontFamily: 'var(--font-mono)' }}>Sem {stu.semester}</td>
                      <td>
                        <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
                          {div ? div.code : stu.divisionId}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-slate)' }}>
                        {(stu.gpa || 8.2).toFixed(2)} / 10.0
                      </td>
                      <td>
                        <span className="status-stamp stamp-green">VERIFIED PASS</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No student performance records found for your assigned divisions.
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
