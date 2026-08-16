import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getDivisions, getAllStudents } from '../../services/firebaseService';
import { formatGPA } from '../../utils/formatters';
import styles from './MyDivisions.module.css';
import { MdArrowBack, MdSearch, MdLock } from 'react-icons/md';

export default function DivisionRoster() {
  const { id } = useParams();
  const { user } = useAuth();
  const [division, setDivision] = useState(null);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    async function loadDivisionRoster() {
      const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];

      if (!assignedIds.includes(id)) {
        setIsUnauthorized(true);
        return;
      }

      const allDivs = await getDivisions();
      const currentDiv = (allDivs || []).find((d) => d.id === id);
      setDivision(currentDiv);

      const allStus = await getAllStudents();
      const divStus = (allStus || []).filter((s) => s.divisionId === id);
      setStudents(divStus);
    }

    loadDivisionRoster();
  }, [id, user]);

  if (isUnauthorized) {
    return (
      <>
        <Navbar title="Access Control Violation" />
        <div className={styles.page}>
          <div className={styles.header}>
            <div className={styles.codeBadge} style={{ background: 'var(--stamp-red-bg)', color: 'var(--stamp-red)' }}>
              <MdLock /> RESTRICTED DIVISION ACCESS
            </div>
            <h1 className={styles.title} style={{ marginTop: '0.5rem' }}>
              Unauthorized Division Scope
            </h1>
            <p className={styles.subtitle}>
              You do not have administrative or faculty clearance to access division <code>{id}</code>.
            </p>
            <Link to="/teacher/divisions" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
              <MdArrowBack /> Return to My Divisions
            </Link>
          </div>
        </div>
      </>
    );
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar title={`Division Roster: ${division?.code || id}`} />
      <main className="page-body">
        <Link to="/teacher/divisions" className="btn btn-secondary btn-sm" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <MdArrowBack /> Back to Divisions Grid
        </Link>

        <div className="page-header">
          <h1 className="page-title">{division?.name || `Division ${id}`}</h1>
          <p className="page-subtitle">
            {division?.department} • Semester {division?.semester} • {students.length} Enrolled Candidates
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
          <div className="input-wrapper">
            <MdSearch className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search candidate name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Roster Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Roll Number</th>
                <th>Candidate Name</th>
                <th>Official Email</th>
                <th>Academic GPA</th>
                <th>Activation Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No enrolled candidates found in this division roster matching your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id || s.rollNumber}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{s.rollNumber}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatGPA(s.gpa)}</td>
                    <td>
                      <span className={`badge ${s.activated ? 'badge-success' : 'badge-warning'}`}>
                        {s.activated ? 'Activated' : 'Pending Activation'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </>
  );
}
