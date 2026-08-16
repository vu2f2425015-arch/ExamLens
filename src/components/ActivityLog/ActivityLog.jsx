import { useEffect, useRef } from 'react';
import styles from './ActivityLog.module.css';

const severityStamp = (sev) => {
  if (sev === 'critical') return { color: 'var(--stamp-red)', label: 'CRITICAL' };
  if (sev === 'danger')   return { color: 'var(--stamp-red)', label: 'HIGH RISK' };
  if (sev === 'warning')  return { color: 'var(--stamp-ochre)', label: 'CAUTION' };
  return { color: 'var(--stamp-green)', label: 'VERIFIED' };
};

export default function ActivityLog({ logs = [], autoScroll = true }) {
  const endRef = useRef(null);

  useEffect(() => {
    if (autoScroll && endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>PROCTORING AUDIT LOG</span>
        <span className={styles.count}>[{logs.length} EVENTS RECORDED]</span>
      </div>
      <div className={styles.logList}>
        {logs.map((log) => {
          const stamp = severityStamp(log.severity);
          return (
            <div key={log.id} className={styles.logItem}>
              <span className={styles.stampTag} style={{ color: stamp.color, borderColor: stamp.color }}>
                {stamp.label}
              </span>
              <div className={styles.logContent}>
                <span className={styles.logType}>
                  {log.icon} {log.type}
                </span>
                <span className={styles.logTime}>{log.time}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
