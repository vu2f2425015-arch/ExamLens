import Navbar from '../../components/Navbar/Navbar';
import styles from './Recordings.module.css';
import { MdPlayCircle, MdDownload, MdDelete, MdFiberManualRecord, MdWarning } from 'react-icons/md';

const ANOMALY_CLIPS = [
  { id: 1, student: 'Arjun Sharma',   exam: 'DBMS',  date: '29 Jul 2026', duration: '0:35', size: '14.2 MB', anomaly: 'Face Lost', severity: 'warning' },
  { id: 2, student: 'Priya Mehta',    exam: 'DBMS',  date: '29 Jul 2026', duration: '0:38', size: '15.8 MB', anomaly: 'Multiple Faces', severity: 'critical' },
  { id: 3, student: 'Rahul Verma',    exam: 'DBMS',  date: '29 Jul 2026', duration: '0:32', size: '12.5 MB', anomaly: 'Noise Detected', severity: 'low' },
  { id: 4, student: 'Sneha Patel',    exam: 'DBMS',  date: '29 Jul 2026', duration: '0:39', size: '16.1 MB', anomaly: 'Tab Switch', severity: 'danger' },
  { id: 5, student: 'Ananya Roy',     exam: 'OS',    date: '28 Jul 2026', duration: '0:40', size: '16.5 MB', anomaly: 'Phone Detected', severity: 'danger' },
  { id: 6, student: 'Divya Krishnan', exam: 'OS',    date: '28 Jul 2026', duration: '0:36', size: '14.8 MB', anomaly: 'Camera Disabled', severity: 'critical' },
];

export default function Recordings() {
  return (
    <>
      <Navbar title="Anomaly Clip Vault" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Anomaly Event Clips</h1>
            <p className="page-subtitle">Automated 30–40 second video clips triggered by AI anomaly detection</p>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-danger"><MdFiberManualRecord /> {ANOMALY_CLIPS.length} Event Clips</span>
          </div>
        </div>

        <div className={styles.grid}>
          {ANOMALY_CLIPS.map(r => (
            <div key={r.id} className={styles.card}>
              {/* Thumbnail */}
              <div className={styles.thumbnail}>
                <div className={styles.placeholder}>
                  <div className={styles.initials}>
                    {r.student.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className={styles.recordingBadge}>
                    <MdFiberManualRecord className={styles.recDot} />
                    30-40s CLIP
                  </div>
                </div>
                <button className={styles.playBtn} title={`Play ${r.anomaly} clip`}>
                  <MdPlayCircle />
                </button>
                <div className={styles.duration}>{r.duration}</div>
              </div>

              {/* Info */}
              <div className={styles.info}>
                <div className={styles.studentName}>{r.student}</div>
                <div className={styles.examName}>{r.exam} · {r.date}</div>
                <div className={styles.meta}>
                  <span>{r.size}</span>
                  <span className={`badge ${
                    r.severity === 'critical' ? 'badge-danger' :
                    r.severity === 'danger' ? 'badge-danger' :
                    r.severity === 'warning' ? 'badge-warning' : 'badge-accent'
                  }`} style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <MdWarning size={11} /> {r.anomaly}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  <MdPlayCircle /> Play Clip
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" title="Download Clip">
                  <MdDownload />
                </button>
                <button className="btn btn-ghost btn-sm btn-icon" title="Delete Clip">
                  <MdDelete />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
