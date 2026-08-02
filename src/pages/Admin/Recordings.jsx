import Navbar from '../../components/Navbar/Navbar';
import styles from './Recordings.module.css';
import { MdPlayCircle, MdDownload, MdDelete, MdFiberManualRecord } from 'react-icons/md';

const RECORDINGS = [
  { id: 1, student: 'Arjun Sharma',   exam: 'DBMS',  date: '29 Jul 2026', duration: '55:22', size: '1.2 GB', violations: 2, thumbnail: null },
  { id: 2, student: 'Priya Mehta',    exam: 'DBMS',  date: '29 Jul 2026', duration: '59:41', size: '1.4 GB', violations: 0, thumbnail: null },
  { id: 3, student: 'Rahul Verma',    exam: 'DBMS',  date: '29 Jul 2026', duration: '48:10', size: '1.0 GB', violations: 1, thumbnail: null },
  { id: 4, student: 'Sneha Patel',    exam: 'DBMS',  date: '29 Jul 2026', duration: '58:05', size: '1.3 GB', violations: 3, thumbnail: null },
  { id: 5, student: 'Ananya Roy',     exam: 'OS',    date: '28 Jul 2026', duration: '78:30', size: '1.8 GB', violations: 0, thumbnail: null },
  { id: 6, student: 'Divya Krishnan', exam: 'OS',    date: '28 Jul 2026', duration: '82:14', size: '2.0 GB', violations: 1, thumbnail: null },
];

export default function Recordings() {
  return (
    <>
      <Navbar title="Recordings" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Recordings</h1>
            <p className="page-subtitle">All exam session recordings with AI analysis</p>
          </div>
          <div className="flex gap-2">
            <span className="badge badge-danger"><MdFiberManualRecord /> {RECORDINGS.length} recordings</span>
          </div>
        </div>

        <div className={styles.grid}>
          {RECORDINGS.map(r => (
            <div key={r.id} className={styles.card}>
              {/* Thumbnail */}
              <div className={styles.thumbnail}>
                <div className={styles.placeholder}>
                  <div className={styles.initials}>
                    {r.student.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className={styles.recordingBadge}>
                    <MdFiberManualRecord className={styles.recDot} />
                    REC
                  </div>
                </div>
                <button className={styles.playBtn}>
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
                  {r.violations > 0 && (
                    <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>
                      {r.violations} violations
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <button className="btn btn-secondary btn-sm">
                  <MdPlayCircle /> Play
                </button>
                <button className="btn btn-ghost btn-sm btn-icon">
                  <MdDownload />
                </button>
                <button className="btn btn-ghost btn-sm btn-icon">
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
