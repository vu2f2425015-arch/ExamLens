import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import ChartCard from '../../components/ChartCard/ChartCard';
import ActivityLog from '../../components/ActivityLog/ActivityLog';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getDivisions, getExams, getAllStudents, getAlerts } from '../../services/firebaseService';
import styles from './TeacherDashboard.module.css';
import {
  MdClass, MdAssignment, MdPeople, MdArrowForward, MdAdd,
  MdWarning, MdBarChart, MdCheckCircle
} from 'react-icons/md';
import {
  BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [assignedDivisions, setAssignedDivisions] = useState([]);
  const [myExams, setMyExams] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [divisionChartData, setDivisionChartData] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function loadData() {
      const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];

      const [allDivs, allExams, allStus, allAlerts] = await Promise.all([
        getDivisions(),
        getExams(),
        getAllStudents(),
        getAlerts()
      ]);

      const filteredDivs = (allDivs || []).filter((d) => assignedIds.includes(d.id));
      setAssignedDivisions(filteredDivs);

      const filteredExams = (allExams || []).filter(
        (e) =>
          e.assignedTeacherId === user?.id ||
          e.assignedTeacherId === user?.employeeId ||
          (e.divisionIds && e.divisionIds.some((did) => assignedIds.includes(did)))
      );
      setMyExams(filteredExams);

      const teacherStudents = (allStus || []).filter((s) => assignedIds.includes(s.divisionId));
      setTotalStudents(teacherStudents.length);

      // Build performance chart data scoped to assigned divisions
      const chartData = filteredDivs.map((div) => {
        const divStus = teacherStudents.filter((s) => s.divisionId === div.id);
        const avgGpa = divStus.length > 0
          ? (divStus.reduce((sum, s) => sum + (s.gpa || 8.0), 0) / divStus.length).toFixed(2)
          : '8.40';
        return {
          division: div.code || div.name,
          avgGpa: parseFloat(avgGpa),
          studentCount: divStus.length
        };
      });
      setDivisionChartData(chartData);

      // Build activity logs for teacher's divisions
      const teacherStudentRolls = new Set(teacherStudents.map(s => s.rollNumber || s.id));
      const filteredAlerts = (allAlerts || []).filter(
        (a) => teacherStudentRolls.has(a.studentId) || (a.divisionId && assignedIds.includes(a.divisionId))
      );

      const mockFallbackLogs = [
        { id: 'al-1', type: 'FACE DETECTED', time: '10:14 AM', severity: 'verified', icon: <MdCheckCircle /> },
        { id: 'al-2', type: 'TAB SWITCH DETECTED', time: '10:22 AM', severity: 'warning', icon: <MdWarning /> },
        { id: 'al-3', type: 'MULTIPLE FACES DETECTED', time: '10:35 AM', severity: 'danger', icon: <MdWarning /> },
      ];

      const mappedLogs = filteredAlerts.length > 0
        ? filteredAlerts.map(a => ({
            id: a.id || `al-${Math.random()}`,
            type: (a.alert || 'PROCTORING FLAG').toUpperCase(),
            time: a.time || '10:00 AM',
            severity: a.severity || 'warning',
            icon: <MdWarning />
          }))
        : mockFallbackLogs;

      setRecentLogs(mappedLogs);
    }

    loadData();
  }, [user]);

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
      <Navbar title="Faculty Dashboard" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Faculty Portal Intelligence</h1>
          <p className="page-subtitle">
            Welcome back, {user?.name || 'Faculty Member'} • {user?.department || 'Department of Computer Science'} • Employee ID: {user?.employeeId || 'FAC2026001'}
          </p>
        </div>

        {/* Resized metric cards matching Admin Dashboard */}
        <div className={styles.statsGrid}>
          <DashboardCard
            title="Assigned Divisions"
            value={assignedDivisions.length.toString()}
            subtitle={`${assignedDivisions.length} active cohort${assignedDivisions.length !== 1 ? 's' : ''}`}
            icon={MdClass}
            color="primary"
            trend={assignedDivisions.length > 0 ? `+${assignedDivisions.length}` : undefined}
            trendUp={true}
          />
          <DashboardCard
            title="Total Enrolled Students"
            value={totalStudents.toString()}
            subtitle="Enrolled across cohorts"
            icon={MdPeople}
            color="accent"
            trend={totalStudents > 0 ? `+${totalStudents}` : undefined}
            trendUp={true}
          />
          <DashboardCard
            title="Active Exam Papers"
            value={myExams.length.toString()}
            subtitle="Assigned exam papers"
            icon={MdAssignment}
            color={myExams.length === 0 ? "danger" : "info"}
            trend={myExams.length > 0 ? `+${myExams.length}` : "0"}
            trendUp={myExams.length > 0}
          />
        </div>

        {/* Analytics & Recent Activity Grid */}
        <div className={styles.dashboardGrid}>
          {/* Performance Chart */}
          <ChartCard
            title="Cohort Performance Overview"
            subtitle="Average student GPA (10-point scale) across assigned divisions"
            action={<span className="badge badge-accent">{totalStudents} Students Tracked</span>}
          >
            <div style={{ height: 260, marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={divisionChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                  <XAxis
                    dataKey="division"
                    tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 10]}
                    tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={customTooltipStyle} />
                  <Bar
                    dataKey="avgGpa"
                    name="Avg GPA (10.0 scale)"
                    fill={isDark ? '#708A9E' : '#1E2B37'}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Live Proctoring Activity Log */}
          <div>
            <ActivityLog logs={recentLogs} autoScroll={false} />
          </div>
        </div>

        {/* My Divisions Overview */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>My Assigned Divisions</h2>
            <Link to="/teacher/divisions" className="btn btn-secondary btn-sm">
              View All Divisions <MdArrowForward />
            </Link>
          </div>

          <div className={styles.divisionList}>
            {assignedDivisions.map((div) => (
              <div key={div.id} className={styles.divCard}>
                <div className={styles.divCode}>{div.code}</div>
                <div className={styles.divName}>{div.name}</div>
                <div className={styles.divMeta}>
                  {div.department} • Semester {div.semester}
                </div>
                <Link
                  to={`/teacher/divisions/${div.id}`}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '0.5rem' }}
                >
                  View Division Roster <MdArrowForward />
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Exams Strip */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Assigned Examination Papers</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link to="/teacher/exams" className="btn btn-secondary btn-sm">
                View All Exams <MdArrowForward />
              </Link>
              <Link to="/teacher/exams/new" className="btn btn-primary btn-sm">
                <MdAdd /> Assign Exam
              </Link>
            </div>
          </div>

          {myExams.length === 0 ? (
            <p className={styles.subtitle}>No exam papers assigned to your divisions yet.</p>
          ) : (
            <div className={styles.upcomingExamsList}>
              {myExams.slice(0, 3).map((exam) => (
                <div key={exam.id} className={styles.examRow}>
                  <div className={styles.examMeta}>
                    <span className={styles.examTitle}>{exam.name}</span>
                    <span className={styles.examSub}>
                      {exam.subject} • Date: {exam.date} • Duration: {exam.duration} mins
                    </span>
                  </div>
                  <span className="status-stamp stamp-slate">
                    {exam.status?.toUpperCase() || 'SCHEDULED'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}

