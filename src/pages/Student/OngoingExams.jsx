import Navbar from '../../components/Navbar/Navbar';
import styles from './OngoingExams.module.css';
import exams from '../../data/exams.json';
import { useNavigate } from 'react-router-dom';
import { formatMinutes } from '../../utils/formatters';
import { MdPlayArrow, MdTimer, MdPerson, MdInfo, MdCameraAlt, MdMic, MdWifi } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function OngoingExams() {
  const navigate = useNavigate();
  const active = exams.filter(e => e.status === 'active');

  if (active.length === 0) {
    return (
      <>
        <Navbar title="Ongoing Exams" />
        <main className="page-body">
          <div className={styles.empty}>
            <MdTimer className={styles.emptyIcon} />
            <h2>No Active Exams</h2>
            <p>There are no exams running right now. Check back later.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="Ongoing Exams" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Ongoing Exams</h1>
          <p className="page-subtitle">{active.length} exam{active.length > 1 ? 's' : ''} currently active — Join immediately</p>
        </div>

        <div className={styles.grid}>
          {active.map((exam, i) => (
            <motion.div
              key={exam.id}
              className={styles.card}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className={styles.cardHeader}>
                <div>
                  <span className="badge badge-accent" style={{ marginBottom: '.5rem' }}>
                    <span className={styles.dot} /> LIVE
                  </span>
                  <h3 className={styles.examName}>{exam.name}</h3>
                  <p className={styles.faculty}><MdPerson size={14} /> {exam.faculty}</p>
                </div>
                <div className={styles.timerBadge}>
                  <MdTimer />
                  <span>{formatMinutes(exam.duration)}</span>
                  <span className={styles.timerSub}>duration</span>
                </div>
              </div>

              <p className={styles.desc}>{exam.description}</p>

              {/* Requirements */}
              <div className={styles.requirements}>
                <div className={styles.reqItem}>
                  <MdCameraAlt className={styles.reqIcon} style={{ color: 'var(--accent)' }} />
                  <span>Camera Required</span>
                </div>
                <div className={styles.reqItem}>
                  <MdMic className={styles.reqIcon} style={{ color: 'var(--accent)' }} />
                  <span>Microphone Required</span>
                </div>
                <div className={styles.reqItem}>
                  <MdWifi className={styles.reqIcon} style={{ color: 'var(--accent)' }} />
                  <span>Stable Internet</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className="btn btn-accent btn-lg"
                  onClick={() => navigate(`/exam/${exam.id}`)}
                >
                  <MdPlayArrow /> Start Exam Now
                </button>
                <button className="btn btn-ghost btn-sm">
                  <MdInfo /> Instructions
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}
