import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getDivisions, getAllStudents, saveDocument, saveLocalStorageExams } from '../../services/firebaseService';
import { assignExamToDivisions } from '../../services/apiService';
import styles from './ExamAssignment.module.css';
import {
  MdSave, MdAssignment, MdSchedule, MdClass, MdCheck, MdInfoOutline
} from 'react-icons/md';

export default function ExamAssignment() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [divisions, setDivisions] = useState([]);
  const [selectedDivisions, setSelectedDivisions] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [statusMsg, setStatusMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 90,
    totalMarks: 100,
    passingMarks: 40,
    totalQuestions: 20,
  });

  useEffect(() => {
    async function loadData() {
      const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];
      const [allDivs, stus] = await Promise.all([
        getDivisions(),
        getAllStudents()
      ]);

      const filteredDivs = (allDivs || []).filter((d) => assignedIds.includes(d.id));
      setDivisions(filteredDivs);
      setSelectedDivisions(assignedIds);
      setAllStudents(stus || []);
    }
    loadData();
  }, [user]);

  const handleToggleDivision = (divId) => {
    setSelectedDivisions((prev) =>
      prev.includes(divId) ? prev.filter((d) => d !== divId) : [...prev, divId]
    );
  };

  // Calculate live summary student count based on selected divisions
  const selectedStudentsCount = allStudents.filter(
    (s) => selectedDivisions.includes(s.divisionId)
  ).length || selectedDivisions.length * 4;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) {
      alert('Please fill out Examination Title and Subject.');
      return;
    }
    if (selectedDivisions.length === 0) {
      alert('Please select at least one assigned division.');
      return;
    }

    setLoading(true);
    setStatusMsg('Saving examination schedule and assigning to selected divisions...');

    const newExam = {
      id: `EXAM_${Date.now()}`,
      ...formData,
      faculty: user?.name || 'Faculty Member',
      assignedTeacherId: user?.employeeId || user?.id || 'FAC2026001',
      divisionIds: selectedDivisions,
      enrolledStudents: selectedStudentsCount,
      status: 'upcoming',
    };

    try {
      // 1. Save to LocalStorage custom exams store
      saveLocalStorageExams([newExam]);

      // 2. Save to Cloud Firestore
      await saveDocument('exams', newExam.id, newExam);

      // 3. Optional REST API backend notification
      await assignExamToDivisions(newExam.id, selectedDivisions).catch(() => {});

      setStatusMsg('Exam paper successfully created and assigned!');
      setTimeout(() => {
        navigate('/teacher/exams');
      }, 1200);
    } catch (err) {
      console.error('Failed to save exam:', err);
      saveLocalStorageExams([newExam]);
      setStatusMsg('Saved exam paper locally to faculty session.');
      setTimeout(() => navigate('/teacher/exams'), 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar title="Assign Exam Paper" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Create & Assign Exam Paper</h1>
          <p className="page-subtitle">
            Schedule an examination paper and assign it to your assigned student divisions.
          </p>
        </div>

        {statusMsg && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            {statusMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formContainer}>
          {/* Section 1: Exam Details */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <MdAssignment className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>1. Examination Details</h2>
            </div>

            <div className={styles.formGrid2}>
              <div className="form-group">
                <label className="form-label">Examination Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Data Structures Mid-Term"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject / Course Code</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science CS201"
                  value={formData.subject}
                  onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label className="form-label">Exam Description & Instructions</label>
              <textarea
                className="form-input"
                rows="3"
                placeholder="Enter examination syllabus, rules, and candidate instructions..."
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
              />
            </div>
          </div>

          {/* Section 2: Schedule & Grading */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <MdSchedule className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>2. Schedule & Grading Criteria</h2>
            </div>

            <div className={styles.formGrid3}>
              <div className="form-group">
                <label className="form-label">Exam Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Duration (Minutes)</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.duration}
                  onChange={(e) => setFormData((p) => ({ ...p, duration: parseInt(e.target.value, 10) || 60 }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.totalMarks}
                  onChange={(e) => setFormData((p) => ({ ...p, totalMarks: parseInt(e.target.value, 10) || 100 }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Passing Marks</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.passingMarks}
                  onChange={(e) => setFormData((p) => ({ ...p, passingMarks: parseInt(e.target.value, 10) || 40 }))}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Question Count</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.totalQuestions}
                  onChange={(e) => setFormData((p) => ({ ...p, totalQuestions: parseInt(e.target.value, 10) || 20 }))}
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Assign to Divisions */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <MdClass className={styles.sectionIcon} />
              <h2 className={styles.sectionTitle}>3. Assign to Divisions</h2>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Select the faculty division cohorts that will be scheduled for this examination paper.
            </p>

            <div className={styles.divisionGrid}>
              {divisions.map((div) => {
                const isSelected = selectedDivisions.includes(div.id);
                const divStusCount = allStudents.filter((s) => s.divisionId === div.id).length || 4;

                return (
                  <div
                    key={div.id}
                    className={`${styles.divisionCard} ${isSelected ? styles.divisionCardSelected : ''}`}
                    onClick={() => handleToggleDivision(div.id)}
                  >
                    <div className={styles.cardHeader}>
                      <span className={styles.divCode}>{div.code}</span>
                      <span className={`${styles.checkBadge} ${isSelected ? styles.checkBadgeSelected : ''}`}>
                        <MdCheck />
                      </span>
                    </div>
                    <div className={styles.divName}>{div.name}</div>
                    <div className={styles.divMeta}>
                      {div.department} • Semester {div.semester} • {divStusCount} Students
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fix 3.3: Live Summary Sidebar / Footer */}
          <div className={styles.summaryFooter}>
            <div className={styles.summaryText}>
              <MdInfoOutline style={{ color: 'var(--primary-slate)', fontSize: '1.25rem' }} />
              <span>
                This exam will be assigned to{' '}
                <span className={styles.summaryHighlight}>{selectedDivisions.length} division{selectedDivisions.length !== 1 ? 's' : ''}</span>,{' '}
                <span className={styles.summaryHighlight}>{selectedStudentsCount} student{selectedStudentsCount !== 1 ? 's' : ''} total</span>.
              </span>
            </div>

            <div className={styles.actionBtns}>
              <button type="button" className="btn btn-secondary" onClick={() => navigate('/teacher/dashboard')}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <MdSave /> {loading ? 'Assigning...' : 'Save & Assign Exam Paper'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </>
  );
}

