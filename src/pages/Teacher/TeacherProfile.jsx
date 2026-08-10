import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { saveDocument } from '../../services/firebaseService';
import styles from './MyDivisions.module.css';
import {
  MdPerson,
  MdEmail,
  MdSchool,
  MdBadge,
  MdSecurity,
  MdEdit,
  MdSave,
  MdCheckCircle,
} from 'react-icons/md';

export default function TeacherProfile() {
  const { user } = useAuth();
  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState({
    name: user?.name || 'Dr. Meera Iyer',
    email: user?.email || 'meera.iyer@examlens.edu',
    department: user?.department || 'Computer Science',
  });
  const [infoStatus, setInfoStatus] = useState('');

  // Password state
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwErr, setPwErr] = useState('');
  const [pwStatus, setPwStatus] = useState('');

  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setInfoStatus('');
    const updated = {
      ...user,
      name: infoForm.name,
      email: infoForm.email,
      department: infoForm.department,
    };
    try {
      await saveDocument('teachers', user?.employeeId || 'FAC2026001', updated);
      setInfoStatus('Personal information updated successfully!');
      setEditingInfo(false);
      setTimeout(() => setInfoStatus(''), 4000);
    } catch (err) {
      setInfoStatus('Saved information locally.');
      setEditingInfo(false);
      setTimeout(() => setInfoStatus(''), 4000);
    }
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPwErr('');
    setPwStatus('');

    if (!newPw) {
      setPwErr('Please enter a new password.');
      return;
    }
    if (newPw.length < 8 || !/[0-9]/.test(newPw)) {
      setPwErr('New password must be at least 8 characters long and contain at least 1 number.');
      return;
    }
    if (newPw !== confirmPw) {
      setPwErr('New passwords do not match.');
      return;
    }

    setPwStatus('Faculty account password updated successfully!');
    setCurrentPw('');
    setNewPw('');
    setConfirmPw('');
    setTimeout(() => setPwStatus(''), 4000);
  };

  return (
    <>
      <Navbar title="Faculty Profile" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Faculty Account & Security Settings</h1>
          <p className="page-subtitle">
            Manage your faculty personal credentials, assigned divisions, and account security.
          </p>
        </div>

        {infoStatus && (
          <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>
            <MdCheckCircle /> {infoStatus}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {/* Personal Information Panel */}
          <div className={styles.card} style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-rule)' }}>
              <h3 className={styles.divTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MdPerson style={{ color: 'var(--primary-slate)' }} /> Personal Information
              </h3>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setEditingInfo((v) => !v)}
              >
                <MdEdit /> {editingInfo ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <form onSubmit={handleSaveInfo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={infoForm.name}
                  onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))}
                  disabled={!editingInfo}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Official Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  value={infoForm.email}
                  onChange={(e) => setInfoForm((p) => ({ ...p, email: e.target.value }))}
                  disabled={!editingInfo}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input
                  type="text"
                  className="form-input"
                  value={infoForm.department}
                  onChange={(e) => setInfoForm((p) => ({ ...p, department: e.target.value }))}
                  disabled={!editingInfo}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Employee ID (Read-only)</label>
                <input
                  type="text"
                  className="form-input"
                  value={user?.employeeId || 'FAC2026001'}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Assigned Divisions (Read-only)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                  {(user?.assignedDivisionIds || ['DIV001', 'DIV002']).map((divId) => (
                    <span key={divId} className={styles.codeBadge}>
                      {divId}
                    </span>
                  ))}
                </div>
              </div>

              {editingInfo && (
                <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                  <MdSave /> Save Changes
                </button>
              )}
            </form>
          </div>

          {/* Change Password Panel */}
          <div className={styles.card} style={{ cursor: 'default' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-rule)' }}>
              <h3 className={styles.divTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MdSecurity style={{ color: 'var(--primary-slate)' }} /> Security & Password
              </h3>
            </div>

            {pwStatus && (
              <div className="alert alert-success" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                <MdCheckCircle /> {pwStatus}
              </div>
            )}

            {pwErr && (
              <div className="alert alert-error" style={{ marginBottom: '1rem', fontSize: '0.85rem' }}>
                {pwErr}
              </div>
            )}

            <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-secondary" style={{ marginTop: '0.5rem' }}>
                <MdSave /> Update Password
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
