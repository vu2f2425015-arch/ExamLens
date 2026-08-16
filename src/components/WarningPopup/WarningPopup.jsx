import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import styles from './WarningPopup.module.css';
import { MdWarning, MdClose } from 'react-icons/md';

export default function WarningPopup({ alert, onClose }) {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [alert, onClose]);

  return (
    <AnimatePresence>
      {alert && (
        <div className={styles.overlay}>
          <div className={`${styles.popup} ${styles[alert.severity] || ''}`}>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close Notice">
              <MdClose />
            </button>

            <div className={styles.iconWrap}>
              <MdWarning className={styles.icon} />
            </div>

            <div className={styles.label}>[ OFFICIAL PROCTORING NOTICE ]</div>
            <div className={styles.message}>{alert.type}</div>
            <p className={styles.sub}>
              Candidate compliance rule triggered. Please resume proper examination posture immediately to maintain assessment validity.
            </p>

            <div className={styles.progressBar}>
              <motion.div
                className={styles.progressFill}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 6, ease: 'linear' }}
              />
            </div>

            <button className={`btn btn-primary ${styles.actionBtn}`} onClick={onClose}>
              Acknowledge & Resume Exam
            </button>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
