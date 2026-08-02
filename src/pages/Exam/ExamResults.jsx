import { useLocation, useNavigate } from 'react-router-dom';
import styles from './ExamResults.module.css';
import { getGrade } from '../../utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  MdCheckCircle, MdCancel, MdTimer, MdEmojiEvents,
  MdHome, MdDownload, MdWarning
} from 'react-icons/md';

export default function ExamResults() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const score        = state?.score        ?? 76;
  const totalMarks   = state?.totalMarks   ?? 100;
  const examName     = state?.examName     ?? 'Database Management Systems';
  const totalQ       = state?.totalQuestions ?? 30;
  const answered     = state?.answered     ?? 28;
  const autoSubmit   = state?.autoSubmit   ?? false;
  const violCount    = state?.violationCount ?? 0;
  const timeTaken    = state?.timeTaken    ?? 55;

  const percentage = Math.round((score / totalMarks) * 100);
  const { grade } = getGrade(percentage);
  const correct  = Math.round(answered * (percentage / 100));
  const wrong    = answered - correct;

  const pieData = [
    { name: 'Correct',     value: correct,         fill: 'var(--stamp-green)' },
    { name: 'Wrong',       value: wrong,            fill: 'var(--stamp-red)' },
    { name: 'Not Attempted',value: totalQ - answered, fill: 'var(--text-muted)' },
  ];

  const passed = percentage >= 40;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Auto-submit notice */}
        {autoSubmit && (
          <div className={styles.autoNotice}>
            <MdWarning />
            {state?.violationCount >= 5
              ? 'Official Notice: Exam was automatically terminated due to maximum compliance threshold violations.'
              : 'Official Notice: Exam session closed automatically as scheduled duration expired.'}
          </div>
        )}

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoMark}>
            <MdEmojiEvents />
          </div>
          <h1 className={styles.title}>OFFICIAL EXAMINATION TRANSCRIPT</h1>
          <p className={styles.subtitle}>{examName}</p>
        </div>

        {/* Score Card Section */}
        <div className={styles.scoreSection}>
          <div
            className={styles.scoreCircle}
            style={{
              borderColor: passed ? 'var(--stamp-green)' : 'var(--stamp-red)',
            }}
          >
            <div className={styles.scoreGrade} style={{ color: passed ? 'var(--stamp-green)' : 'var(--stamp-red)' }}>
              GRADE: {grade}
            </div>
            <div className={styles.scoreVal} style={{ color: 'var(--text-ink)' }}>{score}</div>
            <div className={styles.scoreTotal}>MAX MARKS: {totalMarks}</div>
            <div className={styles.scorePercent} style={{ color: 'var(--text-ink)' }}>{percentage}%</div>
          </div>

          <div className={styles.passFail}>
            {passed ? (
              <span className="status-stamp stamp-green" style={{ fontSize: '0.875rem', padding: '0.4rem 1.25rem' }}>
                <MdCheckCircle /> [ RESULT: SATISFACTORY / PASSED ]
              </span>
            ) : (
              <span className="status-stamp stamp-red" style={{ fontSize: '0.875rem', padding: '0.4rem 1.25rem' }}>
                <MdCancel /> [ RESULT: UNSATISFACTORY / FAILED ]
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          {[
            { icon: MdCheckCircle, val: correct,        label: 'Correct',       color: 'var(--stamp-green)' },
            { icon: MdCancel,      val: wrong,           label: 'Incorrect',     color: 'var(--stamp-red)' },
            { icon: MdEmojiEvents, val: `${totalQ - answered}`, label: 'Unattempted', color: 'var(--text-muted)' },
            { icon: MdTimer,       val: `${timeTaken}m`, label: 'Duration',      color: 'var(--primary-slate)' },
            { icon: MdWarning,     val: violCount,       label: 'Flags',         color: violCount > 0 ? 'var(--stamp-ochre)' : 'var(--stamp-green)' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <s.icon className={styles.statIcon} style={{ color: s.color }} />
              <div className={styles.statVal} style={{ color: s.color }}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className={styles.chartSection}>
          <h3 className={styles.chartTitle}>Response Ledger Breakdown</h3>
          <div className={styles.chartRow}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={2} dataKey="value">
                  {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: '1px solid #D9D7CE', borderRadius: 4, fontFamily: 'IBM Plex Mono', fontSize: '0.8rem' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className={styles.legend}>
              {pieData.map(d => (
                <div key={d.name} className={styles.legendItem}>
                  <div className={styles.legendDot} style={{ background: d.fill }} />
                  <span className={styles.legendLabel}>{d.name}</span>
                  <span className={styles.legendVal}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className="btn btn-secondary" onClick={() => navigate('/student/dashboard')}>
            <MdHome /> Return to Student Desk
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('/student/results')}>
            <MdEmojiEvents /> View All Transcripts
          </button>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <MdDownload /> Print Official Transcript
          </button>
        </div>
      </div>
    </div>
  );
}
