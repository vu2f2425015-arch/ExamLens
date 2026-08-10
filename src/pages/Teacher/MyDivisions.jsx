import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getDivisions, getAllStudents } from '../../services/firebaseService';
import { formatGPA } from '../../utils/formatters';
import styles from './MyDivisions.module.css';
import { MdArrowForward } from 'react-icons/md';

export default function MyDivisions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [divisions, setDivisions] = useState([]);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    async function loadData() {
      const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];

      const allDivs = await getDivisions();
      const filteredDivs = (allDivs || []).filter((d) => assignedIds.includes(d.id));
      setDivisions(filteredDivs);

      const allStus = await getAllStudents();
      setStudents(allStus || []);
    }
    loadData();
  }, [user]);

  const getDivisionMetrics = (divisionId) => {
    const divStudents = students.filter((s) => s.divisionId === divisionId);
    const count = divStudents.length;
    const avgGpa =
      count > 0
        ? formatGPA(divStudents.reduce((acc, curr) => acc + (curr.gpa || 8.0), 0) / count)
        : '0.00';
    return { count, avgGpa };
  };

  return (
    <>
      <Navbar title="My Assigned Divisions" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Assigned Divisions & Cohorts Desk</h1>
          <p className="page-subtitle">
            Select a division card to view full candidate roster, academic standing, and exam performance.
          </p>
        </div>

        <div className={styles.grid}>
          {divisions.map((div) => {
            const { count, avgGpa } = getDivisionMetrics(div.id);
            return (
              <div
                key={div.id}
                className={styles.card}
                onClick={() => navigate(`/teacher/divisions/${div.id}`)}
              >
                <div>
                  <div className={styles.cardHeader}>
                    <span className={styles.codeBadge}>{div.code}</span>
                    <span className={styles.semBadge}>Sem {div.semester}</span>
                  </div>
                  <h3 className={styles.divTitle}>{div.name}</h3>
                  <div className={styles.dept}>{div.department}</div>
                </div>

                <div>
                  <div className={styles.metrics}>
                    <div className={styles.metricItem}>
                      <span className={styles.metricVal}>{count}</span>
                      <span className={styles.metricLabel}>Students Enrolled</span>
                    </div>
                    <div className={styles.metricItem}>
                      <span className={styles.metricVal}>{avgGpa}</span>
                      <span className={styles.metricLabel}>Average GPA</span>
                    </div>
                  </div>

                  <button className="btn btn-secondary btn-sm" style={{ width: '100%', justifyContent: 'center' }}>
                    View Division Roster <MdArrowForward />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
