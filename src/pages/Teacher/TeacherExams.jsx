import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import { useAuth } from '../../context/AuthContext';
import { getExams, getDivisions } from '../../services/firebaseService';
import { MdAssignment, MdAdd, MdClass, MdCheckCircle, MdSchedule } from 'react-icons/md';

export default function TeacherExams() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExamsData() {
      try {
        const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];
        const [allExams, allDivs] = await Promise.all([
          getExams(),
          getDivisions()
        ]);

        setDivisions((allDivs || []).filter((d) => assignedIds.includes(d.id)));

        const filteredExams = (allExams || []).filter(
          (e) =>
            e.assignedTeacherId === user?.id ||
            e.assignedTeacherId === user?.employeeId ||
            (e.divisionIds && e.divisionIds.some((did) => assignedIds.includes(did)))
        );
        setExams(filteredExams);
      } catch (e) {
        console.error('Failed to load teacher exams:', e);
      } finally {
        setLoading(false);
      }
    }
    loadExamsData();
  }, [user]);

  const upcomingCount = exams.filter((e) => e.status === 'upcoming').length;
  const activeCount = exams.filter((e) => e.status === 'active').length;
  const concludedCount = exams.filter((e) => e.status === 'completed' || e.status === 'concluded').length;

  const getDivisionCode = (divId) => {
    const div = divisions.find((d) => d.id === divId);
    return div ? div.code : divId;
  };

  return (
    <>
      <Navbar title="My Assigned Exams" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Assigned Examination Papers</h1>
            <p className="page-subtitle">
              Manage and view status of exams created and assigned to your division cohorts.
            </p>
          </div>
          <Link to="/teacher/exams/new" className="btn btn-primary">
            <MdAdd /> Assign New Exam Paper
          </Link>
        </div>

        {/* Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <DashboardCard title="Total Papers" value={exams.length.toString()} icon={MdAssignment} color="primary" trend={exams.length > 0 ? `+${exams.length}` : undefined} trendUp={true} />
          <DashboardCard title="Scheduled" value={upcomingCount.toString()} icon={MdSchedule} color="info" trend={upcomingCount > 0 ? `+${upcomingCount}` : undefined} trendUp={true} />
          <DashboardCard title="Active Live" value={activeCount.toString()} icon={MdAssignment} color="accent" trend={activeCount > 0 ? `+${activeCount}` : undefined} trendUp={true} />
          <DashboardCard title="Concluded" value={concludedCount.toString()} icon={MdCheckCircle} color="secondary" trend={concludedCount > 0 ? `+${concludedCount}` : undefined} trendUp={true} />
        </div>

        {/* Exams Table */}
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Paper Name</th>
                <th>Subject</th>
                <th>Assigned Divisions</th>
                <th>Scheduled Date</th>
                <th>Duration</th>
                <th>Enrolled</th>
                <th>Status Stamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    Loading examination records...
                  </td>
                </tr>
              ) : exams.length > 0 ? (
                exams.map((exam) => (
                  <tr key={exam.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{exam.name}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{exam.subject}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                        {(exam.divisionIds || []).map((did) => (
                          <span
                            key={did}
                            className="badge badge-info"
                            style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
                          >
                            <MdClass style={{ marginRight: '0.2rem' }} />
                            {getDivisionCode(did)}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{exam.date}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{exam.duration} mins</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{exam.enrolledStudents || 0}</td>
                    <td>
                      <span
                        className={`status-stamp ${
                          exam.status === 'active'
                            ? 'stamp-green'
                            : exam.status === 'upcoming'
                            ? 'stamp-slate'
                            : 'badge-info'
                        }`}
                      >
                        {exam.status === 'active'
                          ? 'STAMP: LIVE'
                          : exam.status === 'upcoming'
                          ? 'STAMP: SCHEDULED'
                          : 'STAMP: CONCLUDED'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No assigned exam papers found. Click "Assign New Exam Paper" to schedule one for your divisions.
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
