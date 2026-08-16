import Navbar from '../../components/Navbar/Navbar';
import styles from './Recordings.module.css';
import { MdPlayCircle, MdDownload, MdDelete, MdFiberManualRecord, MdWarning } from 'react-icons/md';
import { useState, useEffect } from 'react';
import { getAlerts } from '../../services/firebaseService';
import { fetchRecordings, deleteRecordingClip } from '../../services/apiService';

export default function Recordings() {
  const [clips, setClips] = useState([]);

  useEffect(() => {
    async function loadClips() {
      try {
        const apiData = await fetchRecordings().catch(() => null);
        if (apiData && Array.isArray(apiData) && apiData.length > 0) {
          setClips(apiData);
          return;
        }
        const data = await getAlerts();
        setClips(data || []);
      } catch (e) {
        console.error('Failed to load clips:', e);
      }
    }
    loadClips();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteRecordingClip(id).catch(() => {});
    } catch (e) {
      // ignore
    }
    setClips((prev) => prev.filter((c) => c.id !== id));
  };

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
            <span className="badge badge-danger"><MdFiberManualRecord /> {clips.length} Event Clips</span>
          </div>
        </div>

        {clips.length > 0 ? (
          <div className={styles.grid}>
            {clips.map(r => (
              <div key={r.id} className={styles.card}>
                {/* Thumbnail */}
                <div className={styles.thumbnail}>
                  <div className={styles.placeholder}>
                    <div className={styles.initials}>
                      {(r.studentName || r.student || 'ST').split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </div>
                    <div className={styles.recordingBadge}>
                      <MdFiberManualRecord className={styles.recDot} />
                      30-40s CLIP
                    </div>
                  </div>
                  <button className={styles.playBtn} title={`Play ${r.alert || r.anomaly} clip`}>
                    <MdPlayCircle />
                  </button>
                  <div className={styles.duration}>{r.duration || '0:30'}</div>
                </div>

                {/* Info */}
                <div className={styles.info}>
                  <div className={styles.studentName}>{r.studentName || r.student}</div>
                  <div className={styles.examName}>{r.examName || r.exam || 'Session'} · {r.time || r.date || 'Today'}</div>
                  <div className={styles.meta}>
                    <span>{r.size || '12.4 MB'}</span>
                    <span className={`badge ${
                      r.severity === 'critical' ? 'badge-danger' :
                      r.severity === 'danger' ? 'badge-danger' :
                      r.severity === 'warning' ? 'badge-warning' : 'badge-accent'
                    }`} style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                      <MdWarning size={11} /> {r.alert || r.anomaly || 'Event'}
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
                  <button className="btn btn-ghost btn-sm btn-icon" title="Delete Clip" onClick={() => handleDelete(r.id)}>
                    <MdDelete />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--card-bg)', borderRadius: '8px', border: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
            No anomaly video clips recorded. Platform vault is clear.
          </div>
        )}
      </main>
    </>
  );
}
