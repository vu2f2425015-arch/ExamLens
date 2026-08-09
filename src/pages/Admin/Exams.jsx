import Navbar from '../../components/Navbar/Navbar';
import styles from './Exams.module.css';
import { formatMinutes, formatDate } from '../../utils/formatters';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdAssignment, MdClose, MdSave } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { getExams } from '../../services/firebaseService';

export default function Exams() {
  const [exams, setExams] = useState([]);
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit' | 'view' | null
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    faculty: '',
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
    async function loadExams() {
      try {
        const data = await getExams();
        setExams(data || []);
      } catch (e) {
        console.error('Failed to load exams:', e);
      }
    }
    loadExams();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      subject: '',
      faculty: 'Dr. Exam Authority',
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
      setExams((prev) => [newExam, ...prev]);
    } else if (modalMode === 'edit' && selectedExam) {
      setExams((prev) =>
        prev.map((item) =>
          item.id === selectedExam.id
            ? {
                ...item,
                ...formData,
                duration: parseInt(formData.duration, 10),
                totalMarks: parseInt(formData.totalMarks, 10),
                passingMarks: parseInt(formData.passingMarks, 10),
                enrolledStudents: parseInt(formData.enrolledStudents, 10),
                totalQuestions: parseInt(formData.totalQuestions, 10),
              }
            : item
        )
      );
    }
    setModalMode(null);
  };

  return (
    <>
      <Navbar title="Exams" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Exams</h1>
            <p className="page-subtitle">Create, manage, and monitor all examinations</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <MdAdd /> Create Exam
          </button>
        </div>

        {/* Exam Cards Grid */}
        {exams.length > 0 ? (
          <div className={styles.examGrid}>
            {exams.map((exam, i) => (
              <div key={exam.id || i} className={styles.examCard}>
                <div className={styles.examHeader}>
                  <div className={styles.examIcon}><MdAssignment /></div>
                  <span className={`badge ${
                    exam.status === 'active' ? 'badge-accent' :
                    exam.status === 'upcoming' ? 'badge-info' : 'badge-muted'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                <h3 className={styles.examName}>{exam.name}</h3>
                <p className={styles.examSubject}>{exam.subject} · {exam.faculty}</p>
                <p className={styles.examDesc}>{exam.description}</p>

                <div className={styles.examMeta}>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Date</span>
                    <span className={styles.metaVal}>{formatDate(exam.date)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Duration</span>
                    <span className={styles.metaVal}>{formatMinutes(exam.duration)}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Students</span>
                    <span className={styles.metaVal}>{exam.enrolledStudents || 0}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaKey}>Questions</span>
                    <span className={styles.metaVal}>{exam.totalQuestions || 0}</span>
                  </div>
                </div>

                <div className={styles.examProgress}>
                  <div className={styles.progressLabel}>
                    <span>Passing Marks</span>
                    <span>{exam.passingMarks || 40}/{exam.totalMarks || 100}</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${((exam.passingMarks || 40)/(exam.totalMarks || 100))*100}%` }} />
                  </div>
                </div>

                <div className={styles.examActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => handleOpenView(exam)}>
                    <MdVisibility /> View
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEdit(exam)}>
                    <MdEdit /> Edit
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(exam.id)}>
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            No examination papers scheduled. Click "Create Exam" to add papers.
          </div>
        )}

        {/* Modal Dialog for Create / Edit / View */}
        {modalMode && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: '12px', width: '100%', maxWidth: '580px', padding: '1.75rem', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <MdAssignment style={{ color: 'var(--accent)' }} />
                  {modalMode === 'create' && 'Create Examination Paper'}
                  {modalMode === 'edit' && 'Edit Examination Details'}
                  {modalMode === 'view' && `Exam Overview: ${selectedExam?.name}`}
                </h3>
                <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setModalMode(null)} style={{ marginLeft: 'auto' }}>
                  <MdClose size={20} />
                </button>
              </div>

              {modalMode === 'view' && selectedExam ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div><strong>Exam Title:</strong> {selectedExam.name}</div>
                  <div><strong>Subject / Code:</strong> {selectedExam.subject}</div>
                  <div><strong>Faculty In-Charge:</strong> {selectedExam.faculty}</div>
                  <div><strong>Status:</strong> <span className="badge badge-accent">{selectedExam.status}</span></div>
                  <div><strong>Scheduled Date:</strong> {formatDate(selectedExam.date)}</div>
                  <div><strong>Duration:</strong> {formatMinutes(selectedExam.duration)}</div>
                  <div><strong>Passing Criteria:</strong> {selectedExam.passingMarks} / {selectedExam.totalMarks} Marks</div>
                  <div><strong>Enrolled Candidates:</strong> {selectedExam.enrolledStudents} Students</div>
                  <div><strong>Total Question Items:</strong> {selectedExam.totalQuestions} Questions</div>
                  <div style={{ background: 'var(--bg-subtle)', padding: '0.85rem', borderRadius: '6px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    {selectedExam.description || 'No detailed syllabus notes attached.'}
                  </div>
                  <button className="btn btn-primary" onClick={() => setModalMode(null)} style={{ marginTop: '1rem' }}>
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Exam Title *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Data Structures & Algorithms - End-Sem"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject / Course Code *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Computer Science (CS301)"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Faculty In-Charge</label>
                    <input
                      className="form-input"
                      value={formData.faculty}
                      onChange={(e) => setFormData({ ...formData, faculty: e.target.value })}
                    />
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

                  <div className="form-group">
                    <label className="form-label">Enrolled Students</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.enrolledStudents}
                      onChange={(e) => setFormData({ ...formData, enrolledStudents: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active (Live Now)</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label">Description / Syllabus</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief summary of syllabus or guidelines..."
                    />
                  </div>

                  <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => setModalMode(null)}>
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
