import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from './LiveMonitoring.module.css';
import WebcamPanel from '../../components/WebcamPanel/WebcamPanel';
import ActivityLog from '../../components/ActivityLog/ActivityLog';
import LiveChat from '../../components/LiveChat/LiveChat';
import AIStatusBadge from '../../components/AIStatusBadge/AIStatusBadge';
import { useAIProctor } from '../../hooks/useAIProctor';
import students from '../../data/students.json';
import {
  MdPause, MdWarning, MdStop, MdVideocam, MdMic,
  MdSignalWifi4Bar, MdLock, MdPerson, MdTimer
} from 'react-icons/md';

const CANDIDATES = students.filter(s => s.status === 'active').slice(0, 6).map((s, i) => ({
  ...s,
  examName: 'Database Management Systems',
  timeLeft: `${55 - i * 7}:${String((30 + i * 11) % 60).padStart(2,'0')}`,
  connection: i % 3 === 0 ? 'Fair' : 'Good',
  violations: i,
}));

export default function LiveMonitoring() {
  const { logs, currentStatus, addEvent } = useAIProctor({ active: true, sensitivity: 'medium' });
  const [selected, setSelected] = useState(CANDIDATES[0]);

  return (
    <>
      <Navbar title="Live Monitoring" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Live Monitoring</h1>
            <p className="page-subtitle">
              {CANDIDATES.length} candidates active — DBMS Exam
            </p>
          </div>
          <AIStatusBadge status={currentStatus} large />
        </div>

        <div className={styles.layout}>
          {/* Left: Candidate List */}
          <div className={styles.candidateList}>
            {CANDIDATES.map(c => (
              <button
                key={c.id}
                className={`${styles.candidateCard} ${selected?.id === c.id ? styles.selectedCard : ''}`}
                onClick={() => setSelected(c)}
              >
                <div className={styles.candAvatar}>
                  {c.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}
                </div>
                <div className={styles.candInfo}>
                  <div className={styles.candName}>{c.name}</div>
                  <div className={styles.candRoll}>{c.rollNumber}</div>
                  <div className={styles.candMeta}>
                    <MdTimer size={12} />
                    <span>{c.timeLeft} left</span>
                  </div>
                </div>
                <div className={styles.candStatus}>
                  <div className={`pulse-dot ${c.violations > 2 ? 'red' : ''}`} />
                  {c.violations > 0 && (
                    <span className={styles.violBadge}>{c.violations}</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Center: Main Webcam */}
          <div className={styles.centerPanel}>
            <div className={styles.candHeader}>
              <div className={styles.candDetail}>
                <MdPerson />
                <div>
                  <div className={styles.candFullName}>{selected?.name}</div>
                  <div className={styles.candExam}>{selected?.examName} · {selected?.rollNumber}</div>
                </div>
              </div>
              <div className={styles.connBadges}>
                <span className={`badge ${selected?.connection === 'Good' ? 'badge-accent' : 'badge-warning'}`}>
                  <MdSignalWifi4Bar /> {selected?.connection}
                </span>
                <span className="badge badge-accent"><MdMic /> Mic Active</span>
                <span className="badge badge-accent"><MdVideocam /> Cam Active</span>
                <span className="badge badge-primary"><MdLock /> Locked</span>
              </div>
            </div>

            <WebcamPanel status={currentStatus} studentName={selected?.name} />

            {/* Action Buttons */}
            <div className={styles.actions}>
              <button className="btn btn-secondary">
                <MdPause /> Pause Exam
              </button>
              <button className="btn btn-warning" onClick={() => addEvent({ type: 'Manual Warning Issued', severity: 'warning', icon: '⚠' })}>
                <MdWarning /> Issue Warning
              </button>
              <button className="btn btn-danger">
                <MdStop /> Terminate
              </button>
              <button className="btn btn-ghost">
                <MdVideocam /> View Recording
              </button>
            </div>
          </div>

          {/* Right: Logs + Chat */}
          <div className={styles.rightPanel}>
            <div className={styles.logWrap}>
              <ActivityLog logs={logs} autoScroll />
            </div>
            <div className={styles.chatWrap}>
              <LiveChat studentName={selected?.name} />
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
