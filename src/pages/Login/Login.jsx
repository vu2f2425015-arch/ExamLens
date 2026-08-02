import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import styles from './Login.module.css';
import {
  MdSecurity, MdPerson, MdLock, MdAdminPanelSettings,
  MdSchool, MdVisibility, MdVisibilityOff
} from 'react-icons/md';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [adminCreds,   setAdminCreds]   = useState({ id: '', password: '' });
  const [studentCreds, setStudentCreds] = useState({ id: '', password: '' });
  const [adminErr,     setAdminErr]     = useState('');
  const [studentErr,   setStudentErr]   = useState('');
  const [showAdminPw,  setShowAdminPw]  = useState(false);
  const [showStudPw,   setShowStudPw]   = useState(false);
  const [loading,      setLoading]      = useState(null); // 'admin' | 'student'
  const [remember,     setRemember]     = useState(false);

  const handleLogin = async (role) => {
    const creds = role === 'admin' ? adminCreds : studentCreds;
    setLoading(role);
    await new Promise(r => setTimeout(r, 400));
    const result = login(role, creds);
    setLoading(null);
    if (result.success) {
      navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } else {
      role === 'admin' ? setAdminErr(result.error) : setStudentErr(result.error);
    }
  };

  return (
    <div className={styles.page}>
      {/* Top Bar Theme Toggle */}
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      {/* Institutional Pattern Accent Background */}
      <div className={styles.bg} />

      {/* Portal Header */}
      <div className={styles.header}>
        <div className={styles.logoMark}>
          <MdSecurity />
        </div>
        <h1 className={styles.logoText}>ExamLens</h1>
        <p className={styles.tagline}>University Examination & Automated Proctoring Authority Portal</p>
        <div className={styles.chips}>
          <span className={styles.chip}>[ DESK: SECURE ]</span>
          <span className={styles.chip}>[ PROCTORING ENGINE: OPERATIONAL ]</span>
          <span className={styles.chip}>[ SESSION: TERM II ]</span>
          <ThemeToggle />
        </div>
      </div>

      {/* Authentication Desks */}
      <div className={styles.cards}>
        {/* Student Desk Card */}
        <div className={`${styles.card} ${styles.studentCard}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.studentIcon}`}>
              <MdSchool />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Candidate Entry</h2>
              <p className={styles.cardSub}>Enter your student registration pass</p>
            </div>
          </div>

          <div className={styles.demoHint}>
            <span>DEMO CREDENTIALS: </span>
            <code>student / student123</code>
          </div>

          <div className={styles.fields}>
            <div className="form-group">
              <label className="form-label">Student / Candidate ID</label>
              <div className="input-wrapper">
                <MdPerson className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 2026-CS-891"
                  value={studentCreds.id}
                  onChange={e => setStudentCreds(p => ({ ...p, id: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin('student')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Access Passcode</label>
              <div className={`input-wrapper ${styles.pwWrapper}`}>
                <MdLock className="input-icon" />
                <input
                  type={showStudPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter passcode"
                  value={studentCreds.password}
                  onChange={e => setStudentCreds(p => ({ ...p, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin('student')}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowStudPw(v => !v)}
                  title={showStudPw ? "Hide passcode" : "Show passcode"}
                >
                  {showStudPw ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {studentErr && <div className={styles.error}>{studentErr}</div>}

            <div className={styles.options}>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember Desk Session
              </label>
              <a href="#" className={styles.forgot}>Reset Passcode</a>
            </div>

            <button
              className={`btn btn-accent ${styles.loginBtn}`}
              onClick={() => handleLogin('student')}
              disabled={loading === 'student'}
            >
              {loading === 'student' ? <span className="spinner" /> : null}
              {loading === 'student' ? 'Authenticating...' : 'Enter Examination Hall'}
            </button>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className={styles.divider} />

        {/* Admin / Proctor Desk Card */}
        <div className={`${styles.card} ${styles.adminCard}`}>
          <div className={styles.cardHeader}>
            <div className={`${styles.cardIcon} ${styles.adminIcon}`}>
              <MdAdminPanelSettings />
            </div>
            <div>
              <h2 className={styles.cardTitle}>Proctor & Coordinator Log In</h2>
              <p className={styles.cardSub}>Institutional administration desk</p>
            </div>
          </div>

          <div className={styles.demoHint}>
            <span>DEMO CREDENTIALS: </span>
            <code>admin / admin123</code>
          </div>

          <div className={styles.fields}>
            <div className="form-group">
              <label className="form-label">Proctor ID / NetID</label>
              <div className="input-wrapper">
                <MdAdminPanelSettings className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. PR-4092"
                  value={adminCreds.id}
                  onChange={e => setAdminCreds(p => ({ ...p, id: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin('admin')}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className={`input-wrapper ${styles.pwWrapper}`}>
                <MdLock className="input-icon" />
                <input
                  type={showAdminPw ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter password"
                  value={adminCreds.password}
                  onChange={e => setAdminCreds(p => ({ ...p, password: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleLogin('admin')}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowAdminPw(v => !v)}
                  title={showAdminPw ? "Hide password" : "Show password"}
                >
                  {showAdminPw ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>

            {adminErr && <div className={styles.error}>{adminErr}</div>}

            <div className={styles.options}>
              <label className={styles.checkLabel}>
                <input type="checkbox" />
                Remember Credentials
              </label>
              <a href="#" className={styles.forgot}>Help Desk</a>
            </div>

            <button
              className={`btn btn-primary ${styles.loginBtn}`}
              onClick={() => handleLogin('admin')}
              disabled={loading === 'admin'}
            >
              {loading === 'admin' ? <span className="spinner" /> : null}
              {loading === 'admin' ? 'Authenticating...' : 'Log In to Proctor Desk'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        ExamLens Institutional Portal • University Examination & Integrity System • Academic Year 2026-2027
      </div>
    </div>
  );
}
