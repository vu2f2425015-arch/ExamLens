import styles from './DashboardCard.module.css';

export default function DashboardCard({
  title, value, subtitle, icon: Icon,
  color = 'primary', trend, trendUp,
}) {
  const colors = {
    primary:   { borderLeft: null,                  badgeBg: 'var(--stamp-slate-bg)', text: 'var(--primary-slate)' },
    secondary: { borderLeft: null,                  badgeBg: 'var(--surface-subtle)', text: 'var(--text-ink)' },
    accent:    { borderLeft: null,                  badgeBg: 'var(--stamp-green-bg)', text: 'var(--stamp-green)' },
    danger:    { borderLeft: '3px solid var(--stamp-red)',   badgeBg: 'var(--stamp-red-bg)',   text: 'var(--stamp-red)' },
    warning:   { borderLeft: '3px solid var(--stamp-ochre)', badgeBg: 'var(--stamp-ochre-bg)', text: 'var(--stamp-ochre)' },
    info:      { borderLeft: null,                  badgeBg: 'var(--stamp-slate-bg)', text: 'var(--primary-slate)' },
  };

  const c = colors[color] || colors.primary;

  return (
    <div
      className={styles.card}
      style={c.borderLeft ? { borderLeft: c.borderLeft } : undefined}
    >
      {/* Icon & Audit Stamp */}
      <div className={styles.iconWrap} style={{ background: c.badgeBg, color: c.text }}>
        {Icon && <Icon />}
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        <div className={styles.value} style={{ color: 'var(--text-ink)' }}>{value}</div>
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
