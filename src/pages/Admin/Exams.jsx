import Navbar from '../../components/Navbar/Navbar';
import styles from './Exams.module.css';
import { formatMinutes, formatDate } from '../../utils/formatters';
import {
  MdAdd,
  MdEdit,
  MdDelete,
  MdVisibility,
  MdAssignment,
  MdClose,
  MdSave,
  MdCalendarToday,
  MdTimer,
  MdPerson,
  MdPeople,
  MdSearch,
} from 'react-icons/md';
import { useState, useEffect } from 'react';
import {
  getExams,
  getDivisions,
  getTeachers,
  saveLocalStorageExams,
  saveDocument,
} from '../../services/firebaseService';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedExam, setSelectedExam] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    faculty: '',
    assignedTeacherId: 'FAC2026001',
    divisionIds: ['DIV001'],
    description: '',
    date: new Date().toISOString().split('T')[0],
    duration: 90,
    totalMarks: 100,
    passingMarks: 40,
    enrolledStudents: 45,
    totalQuestions: 20,
    status: 'upcoming',
  });

  useEffect(() => {
    async function loadExamsData() {
      try {
        const data = await getExams();
        setExams(data || []);
        const divs = await getDivisions();
        setDivisions(divs || []);
        const tchs = await getTeachers();
        setTeachers(tchs || []);
      } catch (e) {
        console.error('Failed to load exams data:', e);
      }
    }
    loadExamsData();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      subject: '',
      faculty: teachers[0]?.name || 'Dr. Meera Iyer',
      assignedTeacherId: teachers[0]?.employeeId || 'FAC2026001',
      divisionIds: ['DIV001'],
      description: '',
      date: new Date().toISOString().split('T')[0],
      duration: 90,
      totalMarks: 100,
      passingMarks: 40,
      enrolledStudents: 50,
      totalQuestions: 20,
      status: 'upcoming',
    });
    setModalMode('create');
  };

  const handleOpenEdit = (exam) => {
    setSelectedExam(exam);
    setFormData({
      name: exam.name || '',
      subject: exam.subject || '',
      faculty: exam.faculty || '',
      assignedTeacherId: exam.assignedTeacherId || 'FAC2026001',
      divisionIds: exam.divisionIds || ['DIV001'],
      description: exam.description || '',
      date: exam.date ? String(exam.date).split('T')[0] : new Date().toISOString().split('T')[0],
      duration: exam.duration || 90,
      totalMarks: exam.totalMarks || 100,
      passingMarks: exam.passingMarks || 40,
      enrolledStudents: exam.enrolledStudents || 0,
      totalQuestions: exam.totalQuestions || 0,
      status: exam.status || 'upcoming',
    });
    setModalMode('edit');
  };

  const handleOpenView = (exam) => {
    setSelectedExam(exam);
    setModalMode('view');
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this examination paper schedule?')) {
      setExams((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleToggleDivision = (divId) => {
    setFormData((prev) => {
      const current = prev.divisionIds || [];
      const updated = current.includes(divId)
        ? current.filter((d) => d !== divId)
        : [...current, divId];
      return { ...prev, divisionIds: updated };
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.subject) {
      alert('Please fill out Exam Title and Subject.');
      return;
    }

    if (modalMode === 'create') {
      const newExam = {
        id: `EXAM_${Date.now()}`,
        ...formData,
        duration: parseInt(formData.duration, 10),
        totalMarks: parseInt(formData.totalMarks, 10),
        passingMarks: parseInt(formData.passingMarks, 10),
        enrolledStudents: parseInt(formData.enrolledStudents, 10),
        totalQuestions: parseInt(formData.totalQuestions, 10),
      };
      saveLocalStorageExams([newExam]);
      saveDocument('exams', newExam.id, newExam);
      setExams((prev) => [newExam, ...prev]);
    } else if (modalMode === 'edit' && selectedExam) {
      const updatedExam = {
        ...selectedExam,
        ...formData,
        duration: parseInt(formData.duration, 10),
        totalMarks: parseInt(formData.totalMarks, 10),
        passingMarks: parseInt(formData.passingMarks, 10),
        enrolledStudents: parseInt(formData.enrolledStudents, 10),
        totalQuestions: parseInt(formData.totalQuestions, 10),
      };
      saveLocalStorageExams([updatedExam]);
      saveDocument('exams', updatedExam.id, updatedExam);
      setExams((prev) =>
        prev.map((item) => (item.id === selectedExam.id ? updatedExam : item))
      );
    }
    setModalMode(null);
  };

  const filteredExams = exams.filter(
    (e) =>
      (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.subject || '').toLowerCase().includes(search.toLowerCase()) ||
      (e.faculty || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar title="Exams Schedule" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Examination Papers</h1>
            <p className="page-subtitle">Schedule, assign to divisions, and configure exam rules</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <MdAdd /> Create New Exam
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
          <div className="input-wrapper">
            <MdSearch className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search exam title, subject, or faculty..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Exams Grid */}
        <div className={styles.examGrid}>
          {filteredExams.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No examination papers found. Click "Create New Exam" to schedule a paper.
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div key={exam.id} className={styles.examCard}>
                <div className={styles.examCardHeader}>
                  <div className={styles.badgeGroup}>
                    <span
                      className={`badge ${
                        exam.status === 'active'
                          ? 'badge-accent'
                          : exam.status === 'upcoming'
                          ? 'badge-info'
                          : 'badge-muted'
                      }`}
                    >
                      {exam.status === 'active' ? 'LIVE' : (exam.status || 'UPCOMING').toUpperCase()}
                    </span>
                    <span className={styles.subjectBadge}>{exam.subject}</span>
                  </div>

                  <div className={styles.actionGroup}>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleOpenView(exam)}
                      title="View Overview"
                    >
                      <MdVisibility size={16} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleOpenEdit(exam)}
                      title="Edit Exam"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm btn-icon"
                      onClick={() => handleDelete(exam.id)}
                      title="Delete Exam"
                      style={{ color: 'var(--stamp-red)' }}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>

                <h3 className={styles.examName}>{exam.name}</h3>

                <div className={styles.facultyRow}>
                  <MdPerson className={styles.facultyIcon} />
                  <span>In-Charge: {exam.faculty}</span>
                </div>

                {exam.description && <p className={styles.examDesc}>{exam.description}</p>}

                <div className={styles.metaGrid}>
                  <div className={styles.metaItem}>
                    <MdCalendarToday className={styles.metaIcon} />
                    <span>{formatDate(exam.date)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MdTimer className={styles.metaIcon} />
                    <span>{formatMinutes(exam.duration)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <MdPeople className={styles.metaIcon} />
                    <span>{exam.enrolledStudents || 45} Candidates</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.divisionChips}>
                      {(exam.divisionIds || ['DIV001']).map((did) => (
                        <span key={did} className={styles.divChip}>
                          {did}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Dialog */}
        {modalMode && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '1rem',
            }}
          >
            <div
              style={{
                background: 'var(--surface-card)',
                border: '1px solid var(--border-rule)',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '620px',
                padding: '1.75rem',
                boxShadow: 'var(--shadow-lg)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '1.25rem',
                }}
              >
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    margin: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '.5rem',
                  }}
                >
                  <MdAssignment style={{ color: 'var(--primary-slate)' }} />
                  {modalMode === 'create' && 'Create Examination Paper'}
                  {modalMode === 'edit' && 'Edit Examination Details'}
                  {modalMode === 'view' && `Exam Overview: ${selectedExam?.name}`}
                </h3>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => setModalMode(null)}
                  style={{ marginLeft: 'auto' }}
                >
                  <MdClose size={20} />
                </button>
              </div>

              {modalMode === 'view' && selectedExam ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div>
                    <strong>Exam Title:</strong> {selectedExam.name}
                  </div>
                  <div>
                    <strong>Subject / Code:</strong> {selectedExam.subject}
                  </div>
                  <div>
                    <strong>Faculty In-Charge:</strong> {selectedExam.faculty}
                  </div>
                  <div>
                    <strong>Assigned Divisions:</strong> {(selectedExam.divisionIds || []).join(', ')}
                  </div>
                  <div>
                    <strong>Scheduled Date:</strong> {formatDate(selectedExam.date)}
                  </div>
                  <div>
                    <strong>Duration:</strong> {formatMinutes(selectedExam.duration)}
                  </div>
                  <div>
                    <strong>Passing Criteria:</strong> {selectedExam.passingMarks} / {selectedExam.totalMarks} Marks
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => setModalMode(null)}
                    style={{ marginTop: '1rem' }}
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSave}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}
                >
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Exam Title *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Data Structures & Algorithms Mid-Term"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject / Course Code *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Data Structures"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Faculty In-Charge</label>
                    <select
                      className="form-input"
                      value={formData.assignedTeacherId}
                      onChange={(e) => {
                        const tch = teachers.find((t) => t.employeeId === e.target.value);
                        setFormData({
                          ...formData,
                          assignedTeacherId: e.target.value,
                          faculty: tch ? tch.name : e.target.value,
                        });
                      }}
                    >
                      {teachers.map((t) => (
                        <option key={t.employeeId} value={t.employeeId}>
                          {t.name} ({t.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Assign to Divisions</label>
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.75rem',
                        flexWrap: 'wrap',
                        marginTop: '0.25rem',
                      }}
                    >
                      {divisions.map((d) => (
                        <label
                          key={d.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            padding: '0.35rem 0.65rem',
                            border: '1px solid var(--border-rule)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(formData.divisionIds || []).includes(d.id)}
                            onChange={() => handleToggleDivision(d.id)}
                          />
                          {d.code}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Scheduled Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (Minutes)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Total Marks</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.totalMarks}
                      onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Passing Marks</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.passingMarks}
                      onChange={(e) => setFormData({ ...formData, passingMarks: e.target.value })}
                    />
                  </div>

                  <div
                    style={{
                      gridColumn: 'span 2',
                      display: 'flex',
                      gap: '0.75rem',
                      justifyContent: 'flex-end',
                      marginTop: '0.5rem',
                    }}
                  >
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setModalMode(null)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      <MdSave /> {modalMode === 'create' ? 'Save & Schedule Exam' : 'Update Exam Paper'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}
