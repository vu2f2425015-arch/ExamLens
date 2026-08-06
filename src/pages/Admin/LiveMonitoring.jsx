import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from './LiveMonitoring.module.css';
import WebcamPanel from '../../components/WebcamPanel/WebcamPanel';
import ActivityLog from '../../components/ActivityLog/ActivityLog';
import LiveChat from '../../components/LiveChat/LiveChat';
import AIStatusBadge from '../../components/AIStatusBadge/AIStatusBadge';
import students from '../../data/students.json';
import {
  MdPause, MdPlayArrow, MdWarning, MdStop, MdVideocam, MdMic,
  MdSignalWifi4Bar, MdLock, MdPerson, MdTimer, MdGridView,
  MdViewStream, MdVisibility, MdArrowBack, MdSearch
} from 'react-icons/md';

const EXAM_SUBJECTS = ['DBMS', 'Operating Systems', 'Computer Networks', 'Machine Learning'];

const INITIAL_CANDIDATES = students.filter(s => s.status === 'active').map((s, i) => ({
  ...s,
  examName: EXAM_SUBJECTS[i % EXAM_SUBJECTS.length],
  timeLeftSeconds: (58 - (i % 5) * 6) * 60 + ((25 + i * 13) % 60),
  connection: i % 4 === 0 ? 'Fair' : 'Good',
  violations: i % 4,
  status: i % 4 === 3 ? 'CRITICAL' : i % 4 === 2 ? 'WARNING' : 'NORMAL',
  isPaused: false,
  logs: [
    { id: 1, time: new Date().toLocaleTimeString(), type: 'Face Verified', severity: 'low', icon: '✅' },
    ...(i % 2 === 1 ? [{ id: 2, time: new Date(Date.now() - 120000).toLocaleTimeString(), type: 'Looking Away', severity: 'warning', icon: '👀' }] : []),
    ...(i % 4 >= 2 ? [{ id: 3, time: new Date(Date.now() - 60000).toLocaleTimeString(), type: 'Tab Switch Attempt', severity: 'danger', icon: '🔄' }] : []),
  ],
}));

export default function LiveMonitoring() {
  const [candidates, setCandidates] = useState(INITIAL_CANDIDATES);
  const [selectedId, setSelectedId] = useState(INITIAL_CANDIDATES[0]?.id);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'focus'
  const [examFilter, setExamFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1-second live countdown ticker
  useEffect(() => {
    const timerId = setInterval(() => {
      setCandidates(prev =>
        prev.map(c => {
          if (c.isPaused || c.timeLeftSeconds <= 0) return c;
          return { ...c, timeLeftSeconds: c.timeLeftSeconds - 1 };
        })
      );
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  // Periodic random AI event simulator for active candidates
  useEffect(() => {
    const eventPool = [
      { type: 'Face Verified', severity: 'low', icon: '✅' },
      { type: 'Looking Away', severity: 'warning', icon: '👀' },
      { type: 'Face Lost', severity: 'warning', icon: '😶' },
      { type: 'Tab Switch Attempt', severity: 'danger', icon: '🔄' },
      { type: 'Multiple Faces Detected', severity: 'critical', icon: '👥' },
      { type: 'Phone Detected', severity: 'danger', icon: '📱' },
      { type: 'Background Noise', severity: 'warning', icon: '🔊' },
    ];

    const eventInterval = setInterval(() => {
      setCandidates(prev => {
        const randomIndex = Math.floor(Math.random() * prev.length);
        const randomEvent = eventPool[Math.floor(Math.random() * eventPool.length)];
        const target = prev[randomIndex];

        const newLog = {
          id: Date.now(),
          time: new Date().toLocaleTimeString(),
          ...randomEvent,
        };

        const isViolation = randomEvent.severity !== 'low';
        const newViolations = isViolation ? target.violations + 1 : target.violations;
        const newStatus = randomEvent.severity === 'critical' ? 'CRITICAL' : (randomEvent.severity === 'danger' || randomEvent.severity === 'warning') ? 'WARNING' : 'NORMAL';

        return prev.map((c, idx) =>
          idx === randomIndex
            ? {
                ...c,
                violations: newViolations,
                status: newStatus,
                logs: [newLog, ...c.logs].slice(0, 40),
              }
            : c
        );
      });
    }, 4500);

    return () => clearInterval(eventInterval);
  }, []);

  const filteredCandidates = candidates.filter(c => {
    const matchesExam = examFilter === 'all' || c.examName === examFilter;
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesSearch;
  });

  const selectedCandidate = candidates.find(c => c.id === selectedId) || filteredCandidates[0] || candidates[0];

  const formatTimeLeft = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleIssueWarning = (candId = selectedId) => {
    const warningLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'Proctor Warning Issued',
      severity: 'warning',
      icon: '⚠',
    };
    setCandidates(prev =>
      prev.map(c =>
        c.id === candId
          ? {
              ...c,
              violations: c.violations + 1,
              status: 'WARNING',
              logs: [warningLog, ...c.logs],
            }
          : c
      )
    );
  };

  const handleTogglePause = (candId = selectedId) => {
    setCandidates(prev =>
      prev.map(c => (c.id === candId ? { ...c, isPaused: !c.isPaused } : c))
    );
  };

  const handleTerminate = (candId = selectedId) => {
    const termLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString(),
      type: 'Exam Terminated by Proctor',
      severity: 'critical',
      icon: '🛑',
    };
    setCandidates(prev =>
      prev.map(c =>
        c.id === candId
          ? {
              ...c,
              status: 'CRITICAL',
              isPaused: true,
              logs: [termLog, ...c.logs],
            }
          : c
      )
    );
  };

  const inspectCandidate = (candId) => {
    setSelectedId(candId);
    setViewMode('focus');
  };

  return (
    <>
      <Navbar title="Live Monitoring" />
      <main className="page-body">
        {/* Page Header with View Switcher */}
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Live Monitoring Wall</h1>
            <p className="page-subtitle">
              {candidates.length} active candidates enrolled — Real-time Multi-Stream Proctoring Telemetry
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className={styles.viewToggle}>
              <button
                className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.activeViewBtn : ''}`}
                onClick={() => setViewMode('grid')}
                title="View all candidates live camera grid"
              >
                <MdGridView size={16} /> Grid View ({filteredCandidates.length} Cams)
              </button>
              <button
                className={`${styles.viewBtn} ${viewMode === 'focus' ? styles.activeViewBtn : ''}`}
                onClick={() => setViewMode('focus')}
                title="Detailed inspector view"
              >
                <MdViewStream size={16} /> Inspector View
              </button>
            </div>

            <AIStatusBadge status={selectedCandidate?.status || 'NORMAL'} large />
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className={styles.filterBar}>
          <button
            className={`${styles.filterBtn} ${examFilter === 'all' ? styles.activeFilterBtn : ''}`}
            onClick={() => setExamFilter('all')}
          >
            All Active Exams ({candidates.length})
          </button>
          {EXAM_SUBJECTS.map(subj => {
            const count = candidates.filter(c => c.examName === subj).length;
            return (
              <button
                key={subj}
                className={`${styles.filterBtn} ${examFilter === subj ? styles.activeFilterBtn : ''}`}
                onClick={() => setExamFilter(subj)}
              >
                {subj} ({count})
              </button>
            );
          })}

          <div className={`input-wrapper ${styles.filterSearch}`}>
            <MdSearch className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search candidate or roll no..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Mode 1: ALL CANDIDATES LIVE GRID VIEW */}
        {viewMode === 'grid' ? (
          <div className={styles.multiGrid}>
            {filteredCandidates.map(c => (
              <div key={c.id} className={styles.gridTile}>
                {/* Tile Header */}
                <div className={styles.gridTileHeader}>
                  <div className={styles.gridCandInfo}>
                    <div className={styles.candAvatar}>
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className={styles.gridCandName}>{c.name}</div>
                      <div className={styles.gridCandMeta}>{c.rollNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
                      <MdTimer size={11} /> {formatTimeLeft(c.timeLeftSeconds)}
                    </span>
                    {c.violations > 0 && (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                        {c.violations} flags
                      </span>
                    )}
                  </div>
                </div>

                {/* Live Webcam Stream */}
                <WebcamPanel status={c.status} studentName={c.name} compact />

                {/* Tile Actions */}
                <div className={styles.gridTileActions}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => inspectCandidate(c.id)}
                  >
                    <MdVisibility /> Inspect
                  </button>
                  <button
                    className="btn btn-warning btn-sm btn-icon"
                    title="Issue Warning"
                    onClick={() => handleIssueWarning(c.id)}
                  >
                    <MdWarning />
                  </button>
                  <button
                    className="btn btn-danger btn-sm btn-icon"
                    title="Terminate Exam"
                    onClick={() => handleTerminate(c.id)}
                  >
                    <MdStop />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Mode 2: SINGLE CANDIDATE FOCUS INSPECTOR VIEW */
          <div>
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: '1rem' }}
              onClick={() => setViewMode('grid')}
            >
              <MdArrowBack /> Back to All Candidates Grid ({candidates.length} Cams)
            </button>

            <div className={styles.layout}>
              {/* Left: Candidate List */}
              <div className={styles.candidateList}>
                {filteredCandidates.map(c => (
                  <button
                    key={c.id}
                    className={`${styles.candidateCard} ${selectedId === c.id ? styles.selectedCard : ''}`}
                    onClick={() => setSelectedId(c.id)}
                  >
                    <div className={styles.candAvatar}>
                      {c.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className={styles.candInfo}>
                      <div className={styles.candName}>{c.name}</div>
                      <div className={styles.candRoll}>{c.rollNumber}</div>
                      <div className={styles.candMeta}>
                        <MdTimer size={12} />
                        <span>{formatTimeLeft(c.timeLeftSeconds)} left</span>
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
                      <div className={styles.candFullName}>{selectedCandidate.name}</div>
                      <div className={styles.candExam}>{selectedCandidate.examName} · {selectedCandidate.rollNumber}</div>
                    </div>
                  </div>
                  <div className={styles.connBadges}>
                    <span className={`badge ${selectedCandidate.connection === 'Good' ? 'badge-accent' : 'badge-warning'}`}>
                      <MdSignalWifi4Bar /> {selectedCandidate.connection}
                    </span>
                    <span className="badge badge-accent"><MdMic /> Mic Active</span>
                    <span className="badge badge-accent"><MdVideocam /> Cam Active</span>
                    <span className="badge badge-primary">
                      <MdLock /> {selectedCandidate.isPaused ? 'PAUSED' : 'LOCKED'}
                    </span>
                  </div>
                </div>

                <WebcamPanel status={selectedCandidate.status} studentName={selectedCandidate.name} />

                {/* Action Buttons */}
                <div className={styles.actions}>
                  <button className="btn btn-secondary" onClick={() => handleTogglePause(selectedCandidate.id)}>
                    {selectedCandidate.isPaused ? <MdPlayArrow /> : <MdPause />}
                    {selectedCandidate.isPaused ? 'Resume Exam' : 'Pause Exam'}
                  </button>
                  <button className="btn btn-warning" onClick={() => handleIssueWarning(selectedCandidate.id)}>
                    <MdWarning /> Issue Warning
                  </button>
                  <button className="btn btn-danger" onClick={() => handleTerminate(selectedCandidate.id)}>
                    <MdStop /> Terminate
                  </button>
                  <button className="btn btn-ghost">
                    <MdVideocam /> View Clip
                  </button>
                </div>
              </div>

              {/* Right: Logs + Chat */}
              <div className={styles.rightPanel}>
                <div className={styles.logWrap}>
                  <ActivityLog logs={selectedCandidate.logs} autoScroll />
                </div>
                <div className={styles.chatWrap}>
                  <LiveChat studentName={selectedCandidate.name} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
