import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTimer } from '../../hooks/useTimer';
import { useAIProctor } from '../../hooks/useAIProctor';
import { useExamState } from '../../hooks/useExamState';
import QuestionPalette from '../../components/QuestionPalette/QuestionPalette';
import WarningPopup from '../../components/WarningPopup/WarningPopup';
import WebcamPanel from '../../components/WebcamPanel/WebcamPanel';
import AIStatusBadge from '../../components/AIStatusBadge/AIStatusBadge';
import { useAuth } from '../../context/AuthContext';
import exams from '../../data/exams.json';
import questions from '../../data/questions.json';
import styles from './ExamInterface.module.css';
import {
  MdFullscreen, MdSignalWifi4Bar, MdVideocam, MdMic,
  MdNavigateNext, MdNavigateBefore, MdFlag, MdClear,
  MdSend
} from 'react-icons/md';

const MAX_VIOLATIONS = 5;

export default function ExamInterface() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const exam = exams.find(e => e.id === id) || exams[1];
  const examQuestions = questions.filter(q => q.examId === id);

  const {
    currentIndex, currentQuestion, answers, marked, summary,
    goTo, next, prev, selectAnswer, clearAnswer, toggleMark,
    getStatus, calculateScore,
  } = useExamState(examQuestions);

  const { logs, currentStatus, violationCount, latestAlert, clearLatestAlert } = useAIProctor({
    active: true,
    sensitivity: 'medium',
  });

  const [showWarning, setShowWarning] = useState(false);
  useEffect(() => {
    if (latestAlert && latestAlert.severity !== 'low') {
      setShowWarning(true);
    }
  }, [latestAlert]);

  const totalSeconds = exam.duration * 60;
  const { formatted, percentRemaining, isLow, isCritical, seconds } = useTimer(
    totalSeconds,
    () => handleSubmit(true)
  );

  useEffect(() => {
    if (violationCount >= MAX_VIOLATIONS) {
      handleSubmit(true);
    }
  }, [violationCount]);

  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {});
    return () => { if (document.fullscreenElement) document.exitFullscreen?.(); };
  }, []);

  const handleSubmit = useCallback((auto = false) => {
    const score = calculateScore();
    navigate(`/exam/${id}/results`, {
      state: {
        score,
        totalMarks: exam.totalMarks,
        examName: exam.name,
        totalQuestions: examQuestions.length,
        answered: Object.keys(answers).length,
        autoSubmit: auto,
        violationCount,
        timeTaken: Math.floor((totalSeconds - seconds) / 60),
      },
    });
  }, [calculateScore, answers, navigate, id, exam, examQuestions.length, seconds, totalSeconds, violationCount]);

  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  if (!currentQuestion) {
    return (
      <div className={styles.noQuestions}>
        <h2>No questions found for this exam session.</h2>
        <button className="btn btn-primary" onClick={() => navigate(-1)}>Return to Desk</button>
      </div>
    );
  }

  return (
    <div className={styles.examPage}>
      {/* Official Warning Popup */}
      <WarningPopup
        alert={showWarning ? latestAlert : null}
        onClose={() => { setShowWarning(false); clearLatestAlert(); }}
      />

      {/* Submit Confirmation Paper Modal */}
      {showSubmitConfirm && (
        <div className={styles.confirmOverlay}>
          <div className={styles.confirmBox}>
            <h3 className={styles.confirmTitle}>Submit Answer Sheet?</h3>
            <p className={styles.confirmText}>
              You have completed <strong>{summary.answered}</strong> of <strong>{summary.total}</strong> examination questions.
              Once submitted, your response will be recorded into the official transcript ledger.
            </p>
            <div className={styles.confirmActions}>
              <button className="btn btn-secondary" onClick={() => setShowSubmitConfirm(false)}>Resume Sitting</button>
              <button className="btn btn-primary" onClick={() => handleSubmit(false)}>
                <MdSend /> Submit Answer Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Chronometer & Status Bar */}
      <header className={styles.topBar}>
        <div className={styles.topLeft}>
          <div className={styles.examTitle}>{exam.name}</div>
          <span className="badge badge-primary" style={{ fontSize: '0.65rem' }}>
            <MdFullscreen size={10} /> SECURE DESK MODE
          </span>
        </div>

        {/* Exam Chronometer Display */}
        <div className={`${styles.timer} ${isCritical ? styles.timerCritical : isLow ? styles.timerLow : ''}`}>
          <div className={styles.timerLabel}>REMAINING TIME</div>
          <div className={styles.timerValue}>{formatted}</div>
          <div className={styles.timerBar}>
            <div
              className={styles.timerFill}
              style={{
                width: `${percentRemaining}%`,
                background: isCritical ? 'var(--stamp-red)' : isLow ? 'var(--stamp-ochre)' : 'var(--primary-slate)',
              }}
            />
          </div>
        </div>

        <div className={styles.topRight}>
          <span className={styles.studentName}>{user?.name}</span>
          <AIStatusBadge status={currentStatus} />
          <div className={styles.statusIcons}>
            <MdSignalWifi4Bar className={styles.statusIcon} style={{ color: 'var(--stamp-green)' }} />
            <MdVideocam className={styles.statusIcon} style={{ color: 'var(--stamp-green)' }} />
            <MdMic className={styles.statusIcon} style={{ color: 'var(--stamp-green)' }} />
          </div>
        </div>
      </header>

      {/* Exam Main Area */}
      <div className={styles.body}>
        {/* Left: Question Palette */}
        <div className={styles.paletteCol}>
          <QuestionPalette
            questions={examQuestions}
            currentIndex={currentIndex}
            getStatus={getStatus}
            goTo={goTo}
            summary={summary}
          />
        </div>

        {/* Center: Ruled Paper Question Sheet */}
        <div className={styles.questionCol}>
          <div className={styles.questionCard}>
            <div className={styles.qHeader}>
              <span className={styles.qNum}>ITEM {currentIndex + 1} OF {examQuestions.length}</span>
              <span className={styles.auditTag}>AUDIT REF: #Q-ITEM-{currentIndex + 1}</span>
              <span className={styles.qMarks}>{currentQuestion.marks} MARKS</span>
            </div>

            <p className={styles.qText}>{currentQuestion.question}</p>

            {/* Answer Options */}
            <div className={styles.options}>
              {currentQuestion.options.map((opt, idx) => {
                const selected = answers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
                    onClick={() => selectAnswer(currentQuestion.id, idx)}
                  >
                    <span className={`${styles.optionLetter} ${selected ? styles.optionLetterSelected : ''}`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={styles.optionText}>{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Action Bar */}
            <div className={styles.qActions}>
              <div className={styles.qActionsLeft}>
                <button
                  className={`btn btn-secondary btn-sm ${marked.has(currentQuestion.id) ? styles.markedBtn : ''}`}
                  onClick={() => toggleMark(currentQuestion.id)}
                >
                  <MdFlag /> {marked.has(currentQuestion.id) ? 'Unmark Review' : 'Mark for Review'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => clearAnswer(currentQuestion.id)}>
                  <MdClear /> Clear Selection
                </button>
              </div>

              <div className={styles.qActionsRight}>
                <button className="btn btn-secondary btn-sm" onClick={prev} disabled={currentIndex === 0}>
                  <MdNavigateBefore /> Previous
                </button>
                {currentIndex < examQuestions.length - 1 ? (
                  <button className="btn btn-primary btn-sm" onClick={next}>
                    Next Item <MdNavigateNext />
                  </button>
                ) : (
                  <button className="btn btn-accent btn-sm" onClick={() => setShowSubmitConfirm(true)}>
                    <MdSend /> Finalize & Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: AI Proctoring Stream */}
        <div className={styles.aiCol}>
          <WebcamPanel status={currentStatus} compact studentName={user?.name} />

          <div className={styles.aiPanel}>
            <div className={styles.aiPanelTitle}>PROCTOR TELEMETRY</div>
            {[
              { label: 'Webcam Stream', ok: true,                 icon: MdVideocam },
              { label: 'Audio Stream',  ok: true,                 icon: MdMic },
              { label: 'Network Ping',  ok: true,                 icon: MdSignalWifi4Bar },
              { label: 'Desk Lock',     ok: true,                 icon: MdFullscreen },
            ].map(({ label, ok, icon: Icon }) => (
              <div key={label} className={styles.aiStatusRow}>
                <Icon className={styles.aiStatusIcon} style={{ color: ok ? 'var(--stamp-green)' : 'var(--stamp-red)' }} />
                <span className={styles.aiStatusLabel}>{label}</span>
                <span className={styles.aiStatusVal} style={{ color: ok ? 'var(--stamp-green)' : 'var(--stamp-red)' }}>
                  {ok ? 'VERIFIED' : 'DISCONNECTED'}
                </span>
              </div>
            ))}

            <div className={styles.violations}>
              <span>COMPLIANCE FLAGS: </span>
              <span style={{ color: violationCount >= 3 ? 'var(--stamp-red)' : 'var(--stamp-ochre)', fontStyle: 'normal' }}>
                {violationCount} / {MAX_VIOLATIONS} ALLOWED
              </span>
            </div>

            <div className={styles.recentAlerts}>
              <div className={styles.alertsTitle}>AUDIT LOG RECENT</div>
              {logs.slice(0, 4).map(log => (
                <div
                  key={log.id}
                  className={styles.alertItem}
                  style={{
                    borderLeft: `3px solid ${log.severity === 'low' ? 'var(--stamp-green)' :
                      log.severity === 'warning' ? 'var(--stamp-ochre)' : 'var(--stamp-red)'}`,
                  }}
                >
                  <span className={styles.alertText}>{log.icon} {log.type}</span>
                  <span className={styles.alertTime}>{log.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
