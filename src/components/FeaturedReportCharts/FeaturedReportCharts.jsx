import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { MdStar, MdTouchApp } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';
import styles from './FeaturedReportCharts.module.css';

const attendanceData = [
  { exam: 'DSA',  appeared: 40, absent: 5 },
  { exam: 'DBMS', appeared: 35, absent: 3 },
  { exam: 'OS',   appeared: 38, absent: 4 },
  { exam: 'CN',   appeared: 37, absent: 3 },
  { exam: 'ML',   appeared: 32, absent: 3 },
];

const rawViolationData = [
  { name: 'Face Lost',    value: 45, lightColor: '#F59E0B', darkColor: '#DDA555' },
  { name: 'Tab Switch',   value: 23, lightColor: '#F97316', darkColor: '#E07A5F' },
  { name: 'Multi Faces',  value: 12, lightColor: '#EF4444', darkColor: '#D96B6B' },
  { name: 'Phone Detect', value: 8,  lightColor: '#DC2626', darkColor: '#C85555' },
  { name: 'Noise',        value: 30, lightColor: '#6C63FF', darkColor: '#708A9E' },
];

const scoreData = [
  { range: '<40',   count: 3 },
  { range: '40-50', count: 5 },
  { range: '50-60', count: 8 },
  { range: '60-70', count: 12 },
  { range: '70-80', count: 18 },
  { range: '80-90', count: 15 },
  { range: '90+',   count: 7 },
];

const modulePerfData = [
  { name: 'DSA',  avgScore: 78, passRate: 92 },
  { name: 'DBMS', avgScore: 83, passRate: 96 },
  { name: 'OS',   avgScore: 74, passRate: 89 },
  { name: 'CN',   avgScore: 71, passRate: 86 },
  { name: 'ML',   avgScore: 86, passRate: 97 },
];

export default function FeaturedReportCharts() {
  const [featuredId, setFeaturedId] = useState('attendance');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const customTooltipStyle = {
    backgroundColor: isDark ? '#171E28' : '#FFFFFF',
    border: `1px solid ${isDark ? '#283142' : '#D9D7CE'}`,
    borderRadius: '6px',
    color: isDark ? '#F0F3F7' : '#0F2042',
    fontSize: '0.8rem',
    fontFamily: 'IBM Plex Mono, monospace',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)'
  };

  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.06)' : '#EAE8E1';
  const axisTickColor = isDark ? '#8896A6' : '#5C6A79';
  const legendTextColor = isDark ? '#C2CBD6' : '#5C6A79';

  const colors = {
    appeared: isDark ? '#708A9E' : '#1E2B37',
    absent: isDark ? '#D96B6B' : '#A62B2B',
    scoreBar: isDark ? '#58A67B' : '#2A6B49',
    avgScoreLine: isDark ? '#708A9E' : '#1E2B37',
    passRateLine: isDark ? '#58A67B' : '#2A6B49',
  };

  const violationData = rawViolationData.map(d => ({
    ...d,
    color: isDark ? d.darkColor : d.lightColor
  }));

  const chartConfigs = [
    {
      id: 'attendance',
      title: 'Attendance Report',
      subtitle: 'Appeared vs Absent candidate distribution by exam paper',
      keyStat: '91% Attendance',
      renderChart: (isHero) => (
        isHero ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={attendanceData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="exam" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: legendTextColor, fontFamily: 'IBM Plex Sans' }} />
              <Bar dataKey="appeared" fill={colors.appeared} radius={[4,4,0,0]} name="Appeared" />
              <Bar dataKey="absent"   fill={colors.absent}   radius={[4,4,0,0]} name="Absent" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <BarChart data={attendanceData} barGap={2} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Bar dataKey="appeared" fill={colors.appeared} radius={[2,2,0,0]} />
              <Bar dataKey="absent"   fill={colors.absent}   radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      )
    },
    {
      id: 'violations',
      title: 'AI Violation Categories',
      subtitle: 'Proctoring flags grouped by AI anomaly engine',
      keyStat: '118 Flagged Events',
      renderChart: (isHero) => (
        isHero ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: 320 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={violationData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke={isDark ? '#132032' : '#FFFFFF'} strokeWidth={2}>
                  {violationData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {violationData.map(d => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <div style={{ width: 12, height: 12, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-body)', flex: 1, fontFamily: 'IBM Plex Mono' }}>{d.name}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-ink)', fontWeight: 600, fontFamily: 'IBM Plex Mono' }}>{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
              <Pie data={violationData} cx="50%" cy="50%" innerRadius={14} outerRadius={26} paddingAngle={2} dataKey="value" stroke={isDark ? '#132032' : '#FFFFFF'} strokeWidth={1}>
                {violationData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      )
    },
    {
      id: 'scores',
      title: 'Score Distribution Spectrum',
      subtitle: 'Number of candidates per evaluation bracket',
      keyStat: '78% Mean Score',
      renderChart: (isHero) => (
        isHero ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={scoreData}>
              <defs>
                <linearGradient id="scoreBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.scoreBar} stopOpacity={1} />
                  <stop offset="100%" stopColor={colors.scoreBar} stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="range" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Bar dataKey="count" fill="url(#scoreBarGrad)" radius={[4,4,0,0]} name="Candidates" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <BarChart data={scoreData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Bar dataKey="count" fill={colors.scoreBar} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      )
    },
    {
      id: 'modulePerf',
      title: 'Module Performance & Pass Rates',
      subtitle: 'Comparative paper average score vs passing rate',
      keyStat: '92% Average Pass',
      renderChart: (isHero) => (
        isHero ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={modulePerfData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} domain={[50,100]} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: legendTextColor, fontFamily: 'IBM Plex Sans' }} />
              <Line type="monotone" dataKey="avgScore" stroke={colors.avgScoreLine} strokeWidth={2.5} dot={{ fill: colors.avgScoreLine, r: 4 }} name="Avg Score (%)" />
              <Line type="monotone" dataKey="passRate" stroke={colors.passRateLine} strokeWidth={2.5} dot={{ fill: colors.passRateLine, r: 4 }} name="Pass Rate (%)" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <LineChart data={modulePerfData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="avgScore" stroke={colors.avgScoreLine} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="passRate" stroke={colors.passRateLine} strokeWidth={1.5} dot={false} strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        )
      )
    }
  ];

  const heroChart = chartConfigs.find(c => c.id === featuredId);
  const thumbnailCharts = chartConfigs.filter(c => c.id !== featuredId);

  return (
    <div className={styles.container}>
      {/* Hero Featured Card (65%) */}
      <div className={styles.heroSlot}>
        <AnimatePresence mode="wait">
          <motion.div
            key={heroChart.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
            className={`${styles.chartCard} ${styles.heroCard}`}
          >
            <div className={`${styles.cardHeader} ${styles.heroHeader}`}>
              <div className={styles.titleGroup}>
                <div className={`${styles.title} ${styles.heroTitle}`}>{heroChart.title}</div>
                <div className={styles.subtitle}>{heroChart.subtitle}</div>
              </div>
              <span className={styles.badgeFeatured}>
                <MdStar size={13} color={isDark ? '#708A9E' : '#1e2b37'} /> ACTIVE FEATURED
              </span>
            </div>
            <div className={`${styles.cardBody} ${styles.heroBody}`}>
              {heroChart.renderChart(true)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails Stack (35%) */}
      <div className={styles.thumbnailsSlot}>
        {thumbnailCharts.map((chart) => (
          <motion.div
            key={chart.id}
            layout
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
            onClick={() => setFeaturedId(chart.id)}
            className={`${styles.chartCard} ${styles.thumbnailCard}`}
            title={`Click to view ${chart.title} in full detail`}
          >
            <div className={styles.cardHeader}>
              <div className={styles.titleGroup}>
                <div className={styles.title}>{chart.title}</div>
              </div>
              <span className={styles.statBadge}>{chart.keyStat}</span>
            </div>
            <div className={styles.thumbnailBody}>
              <div className={styles.miniChartWrapper}>
                {chart.renderChart(false)}
              </div>
              <div className={styles.thumbnailClickHint}>
                <MdTouchApp size={14} /> SWAP
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
