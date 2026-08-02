import styles from './AIStatusBadge.module.css';
import { MdCheckCircle, MdWarning, MdError } from 'react-icons/md';

const config = {
  NORMAL: {
    label: 'STAMP: VERIFIED',
    icon: MdCheckCircle,
    className: 'normal',
  },
  WARNING: {
    label: 'STAMP: ANOMALY CAUTION',
    icon: MdWarning,
    className: 'warning',
  },
  CRITICAL: {
    label: 'STAMP: CRITICAL FLAG',
    icon: MdError,
    className: 'critical',
  },
};

export default function AIStatusBadge({ status = 'NORMAL', large = false }) {
  const { label, icon: Icon, className } = config[status] || config.NORMAL;
  return (
    <div className={`${styles.badge} ${styles[className]} ${large ? styles.large : ''}`}>
      <Icon className={styles.icon} />
      <span>{label}</span>
    </div>
  );
}
