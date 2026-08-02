import styles from './QuestionPalette.module.css';

const statusColors = {
  'answered':       { bg: 'var(--stamp-green)', text: '#FFFFFF' },
  'not-visited':    { bg: 'var(--surface-subtle)', text: 'var(--text-body)' },
  'visited':        { bg: 'var(--stamp-red)',    text: '#FFFFFF' },
  'marked':         { bg: 'var(--stamp-ochre)',  text: '#FFFFFF' },
  'marked-answered':{ bg: 'var(--stamp-ochre)',  text: '#FFFFFF' },
};

export default function QuestionPalette({ questions, currentIndex, getStatus, goTo, summary }) {
  return (
    <div className={styles.palette}>
      <div className={styles.header}>
        <span className={styles.title}>CANDIDATE ANSWER SHEET PALETTE</span>
      </div>

      {/* Legend */}
      <div className={styles.legend}>
        {[
          { label: 'Answered', color: 'var(--stamp-green)' },
          { label: 'Not Answered', color: 'var(--stamp-red)' },
          { label: 'Marked Review', color: 'var(--stamp-ochre)' },
          { label: 'Unvisited', color: 'var(--surface-subtle)' },
        ].map(({ label, color }) => (
          <div key={label} className={styles.legendItem}>
            <span className={styles.legendDot} style={{ background: color }} />
            <span className={styles.legendLabel}>{label}</span>
          </div>
        ))}
      </div>

      {/* Summary Ledger */}
      <div className={styles.summary}>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal} style={{ color: 'var(--stamp-green)' }}>{summary.answered}</span>
          <span className={styles.summaryKey}>Answered</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal} style={{ color: 'var(--stamp-red)' }}>{summary.notAnswered}</span>
          <span className={styles.summaryKey}>Unanswered</span>
        </div>
        <div className={styles.summaryItem}>
          <span className={styles.summaryVal} style={{ color: 'var(--stamp-ochre)' }}>{summary.marked}</span>
          <span className={styles.summaryKey}>Review</span>
        </div>
      </div>

      {/* Grid of Question Index Buttons */}
      <div className={styles.grid}>
        {questions.map((q, idx) => {
          const st = getStatus(q.id);
          const c  = statusColors[st] || statusColors['not-visited'];
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              className={`${styles.qBtn} ${isCurrent ? styles.current : ''}`}
              style={{
                background: isCurrent ? 'var(--primary-slate)' : c.bg,
                color: isCurrent ? '#FFFFFF' : c.text,
                borderColor: isCurrent ? 'var(--primary-slate-dark)' : 'var(--border-rule)',
              }}
              onClick={() => goTo(idx)}
              title={`Question ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
}
