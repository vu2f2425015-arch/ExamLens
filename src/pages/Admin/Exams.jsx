import Navbar from '../../components/Navbar/Navbar';
import styles from './Exams.module.css';
import exams from '../../data/exams.json';
import { formatMinutes, formatDate } from '../../utils/formatters';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdAssignment } from 'react-icons/md';

export default function Exams() {
  return (
    <>
      <Navbar title="Exams" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Exams</h1>
            <p className="page-subtitle">Create, manage, and monitor all examinations</p>
          </div>
          <button className="btn btn-primary">
            <MdAdd /> Create Exam
          </button>
        </div>

        {/* Exam Cards */}
        <div className={styles.examGrid}>
          {exams.map((exam, i) => (
            <div key={exam.id} className={styles.examCard}>
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
                  <span className={styles.metaVal}>{exam.enrolledStudents}</span>
                </div>
                <div className={styles.metaItem}>
                  <span className={styles.metaKey}>Questions</span>
                  <span className={styles.metaVal}>{exam.totalQuestions}</span>
                </div>
              </div>

              <div className={styles.examProgress}>
                <div className={styles.progressLabel}>
                  <span>Passing Marks</span>
                  <span>{exam.passingMarks}/{exam.totalMarks}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${(exam.passingMarks/exam.totalMarks)*100}%` }} />
                </div>
              </div>

              <div className={styles.examActions}>
                <button className="btn btn-ghost btn-sm"><MdVisibility /> View</button>
                <button className="btn btn-secondary btn-sm"><MdEdit /> Edit</button>
                <button className="btn btn-danger btn-sm"><MdDelete /></button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
