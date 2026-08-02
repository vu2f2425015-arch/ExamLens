import styles from './DashboardCard.module.css';

export default function DashboardCard({
  title, value, subtitle, icon: Icon,
  color = 'primary', trend, trendUp,
}) {
  const colors = {
    primary:   { borderLeft: 'var(--primary-slate)', badgeBg: 'var(--stamp-slate-bg)', text: 'var(--primary-slate)' },
    secondary: { borderLeft: 'var(--text-ink)',       badgeBg: 'var(--surface-subtle)', text: 'var(--text-ink)' },
    accent:    { borderLeft: 'var(--stamp-green)',    badgeBg: 'var(--stamp-green-bg)', text: 'var(--stamp-green)' },
    danger:    { borderLeft: 'var(--stamp-red)',      badgeBg: 'var(--stamp-red-bg)',   text: 'var(--stamp-red)' },
    warning:   { borderLeft: 'var(--stamp-ochre)',    badgeBg: 'var(--stamp-ochre-bg)', text: 'var(--stamp-ochre)' },
    info:      { borderLeft: 'var(--primary-slate)', badgeBg: 'var(--stamp-slate-bg)', text: 'var(--primary-slate)' },
  };

  const c = colors[color] || colors.primary;

  return (
    <div
      className={styles.card}
      style={{ borderLeftColor: c.borderLeft }}
    >
      {/* Icon & Audit Stamp */}
      <div className={styles.iconWrap} style={{ background: c.badgeBg, color: c.text }}>
        {Icon && <Icon />}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value} style={{ color: c.text }}>{value}</div>
        {subtitle && <div className={styles.subtitle}>{subtitle}</div>}
      </div>

      {/* Trend */}
      {trend && (
        <div
          className={styles.trend}
          style={{ color: trendUp ? 'var(--stamp-green)' : 'var(--stamp-red)' }}
        >
          {trendUp ? '▲' : '▼'} {trend}
        </div>
      )}
    </div>
  );
}
