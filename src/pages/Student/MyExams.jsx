import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from './MyExams.module.css';
import exams from '../../data/exams.json';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatMinutes } from '../../utils/formatters';
import { MdPlayArrow, MdTimer, MdCalendarToday, MdPerson, MdQuiz } from 'react-icons/md';
import { motion } from 'framer-motion';

export default function MyExams() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const filtered = exams.filter(e => filter === 'all' || e.status === filter);

  return (
    <>
      <Navbar title="My Exams" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">My Exams</h1>
            <p className="page-subtitle">All your assigned examinations</p>
          </div>
          <div className={styles.filterGroup}>
            {['all','active','upcoming','completed'].map(f => (
              <button
                key={f}
                className={`${styles.fBtn} ${filter === f ? styles.fActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          {filtered.map((exam, i) => (
            <motion.div
              key={exam.id}
              className={`${styles.card} ${exam.status === 'active' ? styles.activeCard : ''}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -4 }}
            >
              {exam.status === 'active' && (
                <div className={styles.activePulse}>
                  <div className={styles.activeDot} />
                  LIVE
                </div>
              )}

              <div className={styles.cardTop}>
                <div className={styles.icon}><MdQuiz /></div>
                <span className={`badge ${
                  exam.status === 'active' ? 'badge-accent' :
                  exam.status === 'upcoming' ? 'badge-info' : 'badge-muted'
                }`}>
                  {exam.status}
                </span>
              </div>

              <h3 className={styles.examName}>{exam.name}</h3>

              <div className={styles.metaRow}>
                <MdPerson /> <span>{exam.faculty}</span>
              </div>
              <div className={styles.metaRow}>
                <MdCalendarToday /> <span>{formatDate(exam.date)} · {exam.time}</span>
              </div>
              <div className={styles.metaRow}>
                <MdTimer /> <span>{formatMinutes(exam.duration)} · {exam.totalQuestions} questions</span>
              </div>

              <p className={styles.desc}>{exam.description}</p>

              <button
                className={`btn ${exam.status === 'active' ? 'btn-accent' : exam.status === 'completed' ? 'btn-ghost' : 'btn-secondary'} ${styles.startBtn}`}
                onClick={() => exam.status === 'active' && navigate(`/exam/${exam.id}`)}
                disabled={exam.status !== 'active'}
              >
                {exam.status === 'active'    ? <><MdPlayArrow /> Start Exam</> :
                 exam.status === 'upcoming'  ? 'Not Started Yet' :
                                              'View Results'}
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </>
  );
}
