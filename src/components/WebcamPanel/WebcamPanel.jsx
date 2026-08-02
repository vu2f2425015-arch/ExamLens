import { useEffect, useRef, useState } from 'react';
import styles from './WebcamPanel.module.css';
import AIStatusBadge from '../AIStatusBadge/AIStatusBadge';
import { MdFiberManualRecord, MdSignalWifi4Bar, MdMic, MdVideocam, MdFace } from 'react-icons/md';

export default function WebcamPanel({ status = 'NORMAL', compact = false, studentName = '' }) {
  const videoRef = useRef(null);
  const [camAvailable, setCamAvailable] = useState(false);
  const [faceConf, setFaceConf] = useState(94);

  useEffect(() => {
    navigator.mediaDevices?.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCamAvailable(true);
        }
      })
      .catch(() => setCamAvailable(false));
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Randomly wobble face confidence
  useEffect(() => {
    const id = setInterval(() => {
      setFaceConf(prev => Math.max(70, Math.min(99, prev + (Math.random() * 6 - 3))));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className={`${styles.panel} ${compact ? styles.compact : ''} ${styles[status.toLowerCase()]}`}>
      {/* Video or placeholder */}
      <div className={styles.videoWrapper}>
        {camAvailable ? (
          <video ref={videoRef} autoPlay muted playsInline className={styles.video} />
        ) : (
          <div className={styles.placeholder}>
            <div className={styles.faceBox}>
              <div className={styles.faceCorner} />
              <div className={`${styles.faceCorner} ${styles.tr}`} />
              <div className={`${styles.faceCorner} ${styles.bl}`} />
              <div className={`${styles.faceCorner} ${styles.br}`} />
              <MdFace className={styles.faceIcon} />
              <div className={styles.scanLine} />
            </div>
            {studentName && <div className={styles.studentTag}>{studentName}</div>}
          </div>
        )}

        {/* Overlays */}
        <div className={styles.topOverlay}>
          <span className={styles.recBadge}>
            <MdFiberManualRecord className={styles.recDot} />
            REC
          </span>
          <span className={styles.resBadge}>1080P</span>
          <span className={styles.liveBadge}>LIVE</span>
        </div>

        <div className={styles.bottomOverlay}>
          <div className={styles.metric}>
            <MdFace /> <span>Face: {Math.round(faceConf)}%</span>
          </div>
          <AIStatusBadge status={status} />
        </div>
      </div>

      {/* Status bar */}
      {!compact && (
        <div className={styles.statusBar}>
          <div className={styles.statusItem}>
            <MdVideocam className={styles.statusIcon} style={{ color: camAvailable ? 'var(--accent)' : 'var(--danger)' }} />
            <span>{camAvailable ? 'Camera Active' : 'No Camera'}</span>
          </div>
          <div className={styles.statusItem}>
            <MdMic className={styles.statusIcon} style={{ color: 'var(--accent)' }} />
            <span>Mic Active</span>
          </div>
          <div className={styles.statusItem}>
            <MdSignalWifi4Bar className={styles.statusIcon} style={{ color: 'var(--accent)' }} />
            <span>12 ms</span>
          </div>
        </div>
      )}
    </div>
  );
}
