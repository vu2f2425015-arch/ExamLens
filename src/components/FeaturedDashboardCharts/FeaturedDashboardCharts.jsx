import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { MdStar, MdTouchApp } from 'react-icons/md';
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

const scoreDistData = [
  { name: '90-100', value: 8,  color: '#2A6B49' },
  { name: '80-89',  value: 15, color: '#1E2B37' },
  { name: '70-79',  value: 12, color: '#2D3E4F' },
  { name: '60-69',  value: 7,  color: '#C88A2D' },
  { name: 'Below',  value: 3,  color: '#A62B2B' },
];

const customTooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #D9D7CE',
  borderRadius: '4px',
  color: '#0F2042',
  fontSize: '0.8rem',
  fontFamily: 'IBM Plex Mono, monospace',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
};

export default function FeaturedDashboardCharts() {
  const [featuredId, setFeaturedId] = useState('attendance');

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
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E1" />
              <XAxis dataKey="day" tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#5C6A79', fontFamily: 'IBM Plex Sans' }} />
              <Bar dataKey="present" fill="#1E2B37" radius={[3,3,0,0]} name="Present Candidates" />
              <Bar dataKey="absent"  fill="#A62B2B" radius={[3,3,0,0]} name="Absent Candidates" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <BarChart data={attendanceData} barGap={2} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Bar dataKey="present" fill="#1E2B37" radius={[2,2,0,0]} />
              <Bar dataKey="absent" fill="#A62B2B" radius={[2,2,0,0]} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E1" />
              <XAxis dataKey="time" tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Area type="monotone" dataKey="alerts" stroke="#A62B2B" fill="#FDF2F2" strokeWidth={2.5} name="Anomaly Flags" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <AreaChart data={alertsData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Area type="monotone" dataKey="alerts" stroke="#A62B2B" fill="#FDF2F2" strokeWidth={1.5} />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE8E1" />
              <XAxis dataKey="name" tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5C6A79', fontSize: 12, fontFamily: 'IBM Plex Mono' }} axisLine={false} tickLine={false} domain={[0,100]} />
              <Tooltip contentStyle={customTooltipStyle} />
              <Legend wrapperStyle={{ fontSize: '0.75rem', color: '#5C6A79', fontFamily: 'IBM Plex Sans' }} />
              <Line type="monotone" dataKey="avg" stroke="#1E2B37" strokeWidth={2} dot={{ fill: '#1E2B37', r: 4 }} name="Term Average" />
              <Line type="monotone" dataKey="highest" stroke="#2A6B49" strokeWidth={2} dot={{ fill: '#2A6B49', r: 4 }} name="Highest Mark" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="lowest" stroke="#A62B2B" strokeWidth={2} dot={{ fill: '#A62B2B', r: 4 }} name="Lowest Mark" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={55}>
            <LineChart data={examStatsData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line type="monotone" dataKey="avg" stroke="#1E2B37" strokeWidth={1.5} dot={false} />
              <Line type="monotone" dataKey="highest" stroke="#2A6B49" strokeWidth={1} dot={false} strokeDasharray="2 2" />
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
                <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value">
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
              <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={14} outerRadius={26} paddingAngle={2} dataKey="value">
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
                <MdStar size={13} color="#1e2b37" /> ACTIVE FEATURED
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
