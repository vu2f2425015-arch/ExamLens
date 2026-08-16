import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Profile.module.css';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';
import { MdSave, MdPerson, MdEmail, MdSchool, MdBadge, MdSecurity, MdEdit } from 'react-icons/md';

export default function Profile() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);

  return (
    <>
      <Navbar title="Profile" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">View and update your personal information</p>
        </div>

        <div className={styles.layout}>
          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.avatarWrap}>
              <div className={styles.avatar}>{getInitials(user?.name || 'U')}</div>
              <div className={styles.onlineDot} />
            </div>
            <h2 className={styles.name}>{user?.name}</h2>
            <p className={styles.role}>Student · Semester {user?.semester}</p>
            <div className={styles.rollBadge}>{user?.rollNumber}</div>

            <div className={styles.infoList}>
              <div className={styles.infoItem}><MdEmail /><span>{user?.email}</span></div>
              <div className={styles.infoItem}><MdSchool /><span>{user?.department}</span></div>
              <div className={styles.infoItem}><MdBadge /><span>Semester {user?.semester}</span></div>
            </div>

            <div className={styles.statRow}>
              <div className={styles.stat}><span className={styles.statVal}>3</span><span className={styles.statKey}>Exams</span></div>
              <div className={styles.stat}><span className={styles.statVal}>79%</span><span className={styles.statKey}>Avg Score</span></div>
              <div className={styles.stat}><span className={styles.statVal}>#3</span><span className={styles.statKey}>Best Rank</span></div>
            </div>
          </div>

          {/* Forms */}
          <div className={styles.forms}>
            {/* Personal Info */}
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <span className={styles.formTitle}><MdPerson /> Personal Information</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(v => !v)}>
                  <MdEdit /> {editing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" defaultValue={user?.name} disabled={!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" defaultValue={user?.email} type="email" disabled={!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input className="form-input" defaultValue={user?.department} disabled={!editing} />
                </div>
                <div className="form-group">
                  <label className="form-label">Roll Number</label>
                  <input className="form-input" defaultValue={user?.rollNumber} disabled />
                </div>
                <div className="form-group">
                  <label className="form-label">Semester</label>
                  <input className="form-input" defaultValue={`Semester ${user?.semester}`} disabled />
                </div>
              </div>
              {editing && (
                <button className="btn btn-primary" style={{ marginTop: '1rem' }}>
                  <MdSave /> Save Changes
                </button>
              )}
            </div>

            {/* Change Password */}
            <div className={styles.formCard}>
              <div className={styles.formHeader}>
                <span className={styles.formTitle}><MdSecurity /> Change Password</span>
              </div>
              <div className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <input className="form-input" type="password" placeholder="••••••••" />
                </div>
              </div>
              <button className="btn btn-secondary" style={{ marginTop: '1rem' }}>
                <MdSave /> Update Password
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
