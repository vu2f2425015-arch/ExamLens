import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { MdStar, MdTouchApp } from 'react-icons/md';
import { useTheme } from '../../context/ThemeContext';
import styles from './FeaturedDashboardCharts.module.css';

const attendanceData = [
  { day: 'Mon', present: 38, absent: 7 },
  { day: 'Tue', present: 42, absent: 3 },
  { day: 'Wed', present: 35, absent: 10 },
  { day: 'Thu', present: 45, absent: 0 },
  { day: 'Fri', present: 40, absent: 5 },
  { day: 'Sat', present: 28, absent: 17 },
];

const examStatsData = [
  { name: 'DSA',  avg: 76, highest: 95, lowest: 42 },
  { name: 'DBMS', avg: 81, highest: 98, lowest: 55 },
  { name: 'OS',   avg: 72, highest: 92, lowest: 38 },
  { name: 'CN',   avg: 69, highest: 89, lowest: 31 },
  { name: 'ML',   avg: 84, highest: 99, lowest: 61 },
];

const alertsData = [
  { time: '10am', alerts: 3 },
  { time: '11am', alerts: 7 },
  { time: '12pm', alerts: 5 },
  { time: '1pm',  alerts: 12 },
  { time: '2pm',  alerts: 9 },
  { time: '3pm',  alerts: 4 },
];

const rawScoreDistData = [
  { name: '90-100', value: 8,  lightColor: '#2A6B49', darkColor: '#4ADE80' },
  { name: '80-89',  value: 15, lightColor: '#1E2B37', darkColor: '#38BDF8' },
  { name: '70-79',  value: 12, lightColor: '#2D3E4F', darkColor: '#818CF8' },
  { name: '60-69',  value: 7,  lightColor: '#C88A2D', darkColor: '#FBBF24' },
  { name: 'Below',  value: 3,  lightColor: '#A62B2B', darkColor: '#F87171' },
];

export default function FeaturedDashboardCharts() {
  const [featuredId, setFeaturedId] = useState('attendance');
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const customTooltipStyle = {
    backgroundColor: isDark ? '#132032' : '#FFFFFF',
    border: `1px solid ${isDark ? '#2D425C' : '#D9D7CE'}`,
    borderRadius: '6px',
    color: isDark ? '#F8FAFC' : '#0F2042',
    fontSize: '0.8rem',
    fontFamily: 'IBM Plex Mono, monospace',
    boxShadow: isDark ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 8px rgba(0,0,0,0.08)'
  };

  const gridStroke = isDark ? 'rgba(255, 255, 255, 0.08)' : '#EAE8E1';
  const axisTickColor = isDark ? '#94A3B8' : '#5C6A79';
  const legendTextColor = isDark ? '#CBD5E1' : '#5C6A79';

  const colors = {
    present: isDark ? '#3B82F6' : '#1E2B37',
    absent: isDark ? '#F87171' : '#A62B2B',
    anomalyStroke: isDark ? '#F87171' : '#A62B2B',
    avgScore: isDark ? '#60A5FA' : '#1E2B37',
    highestMark: isDark ? '#4ADE80' : '#2A6B49',
    lowestMark: isDark ? '#F87171' : '#A62B2B',
  };

  const scoreDistData = rawScoreDistData.map(d => ({
    ...d,
    color: isDark ? d.darkColor : d.lightColor
  }));

  const chartConfigs = [
    {
      id: 'attendance',
      title: 'Candidate Attendance Ledger',
      subtitle: 'Weekly candidate participation',
      keyStat: '83% Attendance',
      renderChart: (isHero) => (
        isHero ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={attendanceData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="day" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: legendTextColor, fontFamily: 'IBM Plex Sans' }} />
              <Bar dataKey="present" fill={colors.present} radius={[3,3,0,0]} name="Present Candidates" />
              <Bar dataKey="absent"  fill={colors.absent}  radius={[3,3,0,0]} name="Absent Candidates" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <BarChart data={attendanceData} barGap={2} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Bar dataKey="present" fill={colors.present} radius={[2,2,0,0]} />
              <Bar dataKey="absent" fill={colors.absent} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        )
      )
    },
    {
      id: 'alerts',
      title: 'Proctoring Anomaly Stream',
      subtitle: 'Flagged event density today',
      keyStat: '40 Total Flags',
      renderChart: (isHero) => (
        isHero ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={alertsData}>
              <defs>
                <linearGradient id="dashAnomalyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.anomalyStroke} stopOpacity={isDark ? 0.5 : 0.25} />
                  <stop offset="95%" stopColor={colors.anomalyStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="time" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="alerts" stroke={colors.anomalyStroke} fill="url(#dashAnomalyGrad)" strokeWidth={2.5} name="Anomaly Flags" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <AreaChart data={alertsData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <defs>
                <linearGradient id="dashAnomalyGradMini" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.anomalyStroke} stopOpacity={isDark ? 0.5 : 0.25} />
                  <stop offset="95%" stopColor={colors.anomalyStroke} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="alerts" stroke={colors.anomalyStroke} fill="url(#dashAnomalyGradMini)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        )
      )
    },
    {
      id: 'performance',
      title: 'Examination Performance Matrix',
      subtitle: 'Score distribution across core modules',
      keyStat: '77.2 Avg Mark',
      renderChart: (isHero) => (
        isHero ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={examStatsData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis dataKey="name" tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: axisTickColor, fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: legendTextColor, fontFamily: 'IBM Plex Sans' }} />
              <Line type="monotone" dataKey="avg" stroke={colors.avgScore} strokeWidth={2.5} dot={{ fill: colors.avgScore, r: 4 }} name="Term Average" />
              <Line type="monotone" dataKey="highest" stroke={colors.highestMark} strokeWidth={2} dot={{ fill: colors.highestMark, r: 4 }} name="Highest Mark" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="lowest" stroke={colors.lowestMark} strokeWidth={2} dot={{ fill: colors.lowestMark, r: 4 }} name="Lowest Mark" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <LineChart data={examStatsData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="avg" stroke={colors.avgScore} strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="highest" stroke={colors.highestMark} strokeWidth={1} dot={false} strokeDasharray="2 2" />
            </LineChart>
          </ResponsiveContainer>
        )
      )
    },
    {
      id: 'grades',
      title: 'Grade Distribution Breakdown',
      subtitle: 'Term grade brackets',
      keyStat: '45 Evaluated',
      renderChart: (isHero) => (
        isHero ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', height: 320 }}>
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value" stroke={isDark ? '#132032' : '#FFFFFF'} strokeWidth={2}>
                  {scoreDistData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={customTooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {scoreDistData.map(d => (
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
              <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={14} outerRadius={26} paddingAngle={2} dataKey="value" stroke={isDark ? '#132032' : '#FFFFFF'} strokeWidth={1}>
                {scoreDistData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )
      )
    }
  ];

  const heroChart = chartConfigs.find(c => c.id === featuredId);
  const thumbnailCharts = chartConfigs.filter(c => c.id !== featuredId);

  return (
    <div className={styles.container}>
      {/* Featured / Hero Position (65% width) */}
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
                <MdStar size={13} color={isDark ? '#60A5FA' : '#1e2b37'} /> ACTIVE FEATURED
              </span>
            </div>
            <div className={`${styles.cardBody} ${styles.heroBody}`}>
              {heroChart.renderChart(true)}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails Column / Row (35% width) */}
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
