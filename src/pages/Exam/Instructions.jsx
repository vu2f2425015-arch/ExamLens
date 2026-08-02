import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import exams from '../../data/exams.json';
import styles from './Instructions.module.css';
import {
  MdCameraAlt, MdMic, MdWifi, MdDesktopMac, MdWarning,
  MdCheckBox, MdCheckBoxOutlineBlank, MdPlayArrow, MdTimer,
  MdQuiz, MdPerson, MdShield
} from 'react-icons/md';

const RULES = [
  { icon: MdCameraAlt,    text: 'Keep your webcam active throughout the exam.' },
  { icon: MdMic,          text: 'Keep your microphone unmuted. Noise may generate alerts.' },
  { icon: MdDesktopMac,   text: 'Do NOT switch tabs or minimize the browser window.' },
  { icon: MdWifi,         text: 'Ensure a stable internet connection before starting.' },
  { icon: MdWarning,      text: 'No mobile phones or other devices are permitted.' },
  { icon: MdShield,       text: 'No multiple faces should appear in the webcam frame.' },
  { icon: MdPerson,       text: 'Your identity will be verified using AI face recognition.' },
  { icon: MdDesktopMac,   text: 'The exam must be taken in fullscreen mode at all times.' },
];

export default function Instructions() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agreed, setAgreed] = useState(false);

  const exam = exams.find(e => e.id === id) || exams[1]; // default to DBMS

  const handleStart = () => {
    if (!agreed) return;
    navigate(`/exam/${exam.id}/take`);
  };

  return (
    <div className={styles.page}>
      <motion.div
        className={styles.container}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}><MdQuiz /></div>
          <div>
            <h1 className={styles.examName}>{exam.name}</h1>
            <p className={styles.examMeta}>
              {exam.faculty} &nbsp;·&nbsp; {exam.totalQuestions} Questions &nbsp;·&nbsp; {exam.duration} Minutes
            </p>
          </div>
          <div className={styles.timeBadge}>
            <MdTimer />
            <div>
              <div className={styles.timeVal}>{exam.duration} min</div>
              <div className={styles.timeKey}>Duration</div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className={styles.stats}>
          {[
            { label: 'Total Questions', value: exam.totalQuestions },
            { label: 'Total Marks',     value: exam.totalMarks },
            { label: 'Passing Marks',   value: exam.passingMarks },
            { label: 'Marks per Q',     value: '3' },
          ].map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statVal}>{s.value}</div>
              <div className={styles.statKey}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rules */}
        <div className={styles.rulesSection}>
          <h2 className={styles.sectionTitle}>📋 Examination Rules</h2>
          <div className={styles.rulesList}>
            {RULES.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={i}
                className={styles.ruleItem}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <div className={styles.ruleIcon}><Icon /></div>
                <span>{text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* System Requirements */}
        <div className={styles.systemCheck}>
          <h2 className={styles.sectionTitle}>🖥️ System Requirements</h2>
          <div className={styles.checkGrid}>
            {[
              { label: 'Webcam',          ok: true },
              { label: 'Microphone',      ok: true },
              { label: 'Internet',        ok: true },
              { label: 'Browser Lock',    ok: true },
              { label: 'Fullscreen API',  ok: true },
            ].map(({ label, ok }) => (
              <div key={label} className={`${styles.checkItem} ${ok ? styles.checkOk : styles.checkFail}`}>
                <span className={styles.checkDot} />
                <span>{label}</span>
                <span className={styles.checkStatus}>{ok ? '✓ Ready' : '✗ Check'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Agreement */}
        <motion.label
          className={`${styles.agreeRow} ${agreed ? styles.agreed : ''}`}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className={styles.checkbox} onClick={() => setAgreed(v => !v)}>
            {agreed
              ? <MdCheckBox className={styles.checkIcon} />
              : <MdCheckBoxOutlineBlank className={styles.checkIcon} />
            }
          </div>
          <span>
            I have read and understood all the examination rules. I agree to abide by them throughout the examination.
            I understand that any violation may result in automatic termination of my exam.
          </span>
        </motion.label>

        {/* Start Button */}
        <motion.button
          className={`btn btn-accent btn-lg ${styles.startBtn}`}
          onClick={handleStart}
          disabled={!agreed}
          whileHover={agreed ? { scale: 1.02 } : {}}
          whileTap={agreed ? { scale: 0.98 } : {}}
        >
          <MdPlayArrow style={{ fontSize: '1.5rem' }} />
          Start Exam Now
        </motion.button>

        <p className={styles.disclaimer}>
          ⚠ This exam is AI-proctored. Your webcam and microphone will be active during the entire session.
        </p>
      </motion.div>
    </div>
  );
}
