import Navbar from '../../components/Navbar/Navbar';
import styles from './Results.module.css';
import results from '../../data/results.json';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { formatDate, getGrade } from '../../utils/formatters';
import { MdDownload, MdEmojiEvents, MdCheckCircle, MdCancel, MdTimer } from 'react-icons/md';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function Results() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const myResults = results.filter(r => r.studentId === user?.id);

  const customTooltipStyle = {
    backgroundColor: isDark ? '#132032' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2D425C' : '#D9D7CE'}`,
    borderRadius: '6px',
    color: isDark ? '#F8FAFC' : '#0F2042',
    fontSize: '0.75rem',
    fontFamily: 'IBM Plex Mono, monospace',
    boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)'
  };

  if (myResults.length === 0) {
    return (
      <>
        <Navbar title="Results" />
        <main className="page-body">
          <div className={styles.empty}>
            <MdEmojiEvents className={styles.emptyIcon} />
            <h2>No Results Yet</h2>
            <p>Complete exams to see your results here.</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar title="Results" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">My Results</h1>
          <p className="page-subtitle">Detailed performance analysis for all completed exams</p>
        </div>

        <div className={styles.grid}>
          {myResults.map((r, i) => {
            const { grade, color } = getGrade(r.percentage);
            const pieData = [
              { name: 'Correct', value: r.correct,     color: '#22C55E' },
              { name: 'Wrong',   value: r.wrong,       color: '#EF4444' },
              { name: 'Skipped', value: r.unattempted, color: '#64748B' },
            ];
            return (
              <motion.div
                key={r.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {/* Header */}
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.examName}>{r.examName}</h3>
                    <p className={styles.submittedAt}>Submitted · {r.submittedAt?.split('T')[0]}</p>
                  </div>
                  <div className={styles.gradeCircle} style={{ borderColor: color, color }}>
                    {grade}
                  </div>
                </div>

                {/* Score highlight */}
                <div className={styles.scoreRow}>
                  <div className={styles.scoreMain}>
                    <span className={styles.scoreVal} style={{ color }}>{r.score}</span>
                    <span className={styles.scoreTotal}>/{r.totalMarks}</span>
                  </div>
                  <div className={styles.percentage} style={{ color }}>{r.percentage}%</div>
                </div>

                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${r.percentage}%`, background: color }}
                  />
                </div>

                {/* Chart + Stats */}
                <div className={styles.chartRow}>
                  <ResponsiveContainer width={90} height={90}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={40} innerRadius={22} paddingAngle={2} dataKey="value" stroke={isDark ? '#132032' : '#FFFFFF'} strokeWidth={1}>
                        {pieData.map((d, j) => <Cell key={j} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v, n) => [v, n]} contentStyle={customTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className={styles.statsGrid}>
                    <div className={styles.stat}>
                      <MdCheckCircle className={styles.statIcon} style={{ color: '#22C55E' }} />
                      <span className={styles.statVal}>{r.correct}</span>
                      <span className={styles.statKey}>Correct</span>
                    </div>
                    <div className={styles.stat}>
                      <MdCancel className={styles.statIcon} style={{ color: '#EF4444' }} />
                      <span className={styles.statVal}>{r.wrong}</span>
                      <span className={styles.statKey}>Wrong</span>
                    </div>
                    <div className={styles.stat}>
                      <MdEmojiEvents className={styles.statIcon} style={{ color: 'var(--warning)' }} />
                      <span className={styles.statVal}>#{r.rank}</span>
                      <span className={styles.statKey}>Rank</span>
                    </div>
                    <div className={styles.stat}>
                      <MdTimer className={styles.statIcon} style={{ color: 'var(--info)' }} />
                      <span className={styles.statVal}>{r.timeTaken}m</span>
                      <span className={styles.statKey}>Time</span>
                    </div>
                  </div>
                </div>

                <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
                  <MdDownload /> Download Report
                </button>
              </motion.div>
            );
          })}
        </div>
      </main>
    </>
  );
}
