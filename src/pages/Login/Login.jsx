import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentActivation } from '../../hooks/useStudentActivation';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import styles from './Login.module.css';
import {
  MdSecurity, MdPerson, MdLock, MdAdminPanelSettings,
  MdSchool, MdVisibility, MdVisibilityOff, MdEmail,
  MdCheckCircle, MdArrowBack
} from 'react-icons/md';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    verifyStudent,
    activateStudent,
    isVerifying,
    isActivating,
    error: hookErr,
    clearErrors
  } = useStudentActivation();

  // Standard Login State
  const [adminCreds, setAdminCreds] = useState({ id: '', password: '' });
  const [studentCreds, setStudentCreds] = useState({ id: '', password: '' });
  const [adminErr, setAdminErr] = useState('');
  const [studentErr, setStudentErr] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [showStudPw, setShowStudPw] = useState(false);
  const [loading, setLoading] = useState(null); // 'admin' | 'student'
  const [remember, setRemember] = useState(false);

  // Student Activation UI State
  const [isActivatingAccount, setIsActivatingAccount] = useState(false);
  const [actStep, setActStep] = useState(1); // 1: Verify, 2: Set Password
  const [actRoll, setActRoll] = useState('');
  const [actEmail, setActEmail] = useState('');
  const [actPassword, setActPassword] = useState('');
  const [actConfirmPw, setActConfirmPw] = useState('');
  const [showActPw, setShowActPw] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [actErr, setActErr] = useState('');
  const [actSuccessMsg, setActSuccessMsg] = useState('');

  const handleLogin = async (role) => {
    const creds = role === 'admin' ? adminCreds : studentCreds;
    setLoading(role);
    setAdminErr('');
    setStudentErr('');
    
    try {
      const result = await login(role, creds);
      setLoading(null);
      if (result.success) {
        navigate(role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
      } else {
        role === 'admin' ? setAdminErr(result.error) : setStudentErr(result.error);
      }
    } catch (err) {
      setLoading(null);
      role === 'admin' ? setAdminErr(err.message || 'Login failed.') : setStudentErr(err.message || 'Login failed.');
    }
  };

  const handleVerifyStudent = async () => {
    setActErr('');
    setActSuccessMsg('');
    if (!actRoll || !actEmail) {
      setActErr('Please enter both Roll Number and Official Email.');
      return;
    }
    try {
      const res = await verifyStudent(actRoll, actEmail);
      if (res.status === 'not_found') {
        setActErr('No matching roster record found for this roll number and official email.');
      } else if (res.status === 'already_activated') {
        setActErr('This account is already activated. You can log in directly.');
      } else if (res.status === 'found') {
        setVerifiedStudent(res.student);
        setActStep(2);
      }
    } catch (err) {
      setActErr(err.message || 'Verification failed.');
    }
  };

  const handleActivateStudent = async () => {
    setActErr('');
    if (!actPassword) {
      setActErr('Please enter a passcode.');
      return;
    }
    if (actPassword !== actConfirmPw) {
      setActErr('Passcodes do not match.');
      return;
    }
    try {
      await activateStudent(actRoll, actPassword);
      setStudentCreds({ id: actRoll, password: actPassword });
      setActSuccessMsg(`Account for ${verifiedStudent.name} (${actRoll}) activated successfully! Credentials pre-filled below.`);
      setIsActivatingAccount(false);
      setActStep(1);
      setActRoll('');
      setActEmail('');
      setActPassword('');
      setActConfirmPw('');
      setVerifiedStudent(null);
    } catch (err) {
      setActErr(err.message || 'Activation failed.');
    }
  };

  const resetActivationForm = () => {
    setIsActivatingAccount(false);
    setActStep(1);
    setActRoll('');
    setActEmail('');
    setActPassword('');
    setActConfirmPw('');
    setVerifiedStudent(null);
    setActErr('');
    clearErrors();
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
        </div>
      </div>

      {/* Authentication Desks */}
      <div className={styles.cards}>
        {/* Student Desk Card */}
        <div className={`${styles.card} ${styles.studentCard}`}>
          {isActivatingAccount ? (
            /* Student Activation Mode */
            <>
              <button type="button" className={styles.backBtn} onClick={resetActivationForm}>
                <MdArrowBack /> Back to Candidate Entry
              </button>

              <div className={styles.cardHeader}>
                <div className={`${styles.cardIcon} ${styles.studentIcon}`}>
                  <MdSchool />
                </div>
                <div>
                  <h2 className={styles.cardTitle}>Account Activation</h2>
                  <p className={styles.cardSub}>
                    {actStep === 1 ? 'Step 1: Verify pre-loaded roster record' : 'Step 2: Set your access passcode'}
                  </p>
                </div>
              </div>

              <div className={styles.demoHint}>
                <span>ROSTER LOOKUP HINT: </span>
                <code>EC2021002 / priya.mehta@examlens.edu</code>
              </div>

              {actStep === 1 ? (
                /* Step 1: Verification Form */
                <div className={styles.fields}>
                  <div className="form-group">
                    <label className="form-label">Roll Number / Student ID</label>
                    <div className="input-wrapper">
                      <MdPerson className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. EC2021002"
                        value={actRoll}
                        onChange={e => setActRoll(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleVerifyStudent()}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Official Email Address</label>
                    <div className="input-wrapper">
                      <MdEmail className="input-icon" />
                      <input
                        type="email"
                        className="form-input"
                        placeholder="e.g. priya.mehta@examlens.edu"
                        value={actEmail}
                        onChange={e => setActEmail(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleVerifyStudent()}
                      />
                    </div>
                  </div>

                  {(actErr || hookErr) && <div className={styles.error}>{actErr || hookErr}</div>}

                  <button
                    className={`btn btn-accent ${styles.loginBtn}`}
                    onClick={handleVerifyStudent}
                    disabled={isVerifying}
                  >
                    {isVerifying ? <span className="spinner" /> : null}
                    {isVerifying ? 'Verifying Roster Record...' : 'Verify Student Record'}
                  </button>
                </div>
              ) : (
                /* Step 2: Set Password Form */
                <div className={styles.fields}>
                  {verifiedStudent && (
                    <div className={styles.studentBadge}>
                      <div className={styles.badgeHeader}>
                        <MdCheckCircle /> Match Found
                      </div>
                      <div className={styles.badgeName}>{verifiedStudent.name}</div>
                      <div className={styles.badgeMeta}>
                        {verifiedStudent.department} • {verifiedStudent.rollNumber}
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Create Access Passcode</label>
                    <div className={`input-wrapper ${styles.pwWrapper}`}>
                      <MdLock className="input-icon" />
                      <input
                        type={showActPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Min 8 chars, 1 number"
                        value={actPassword}
                        onChange={e => setActPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowActPw(v => !v)}
                      >
                        {showActPw ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm Access Passcode</label>
                    <div className="input-wrapper">
                      <MdLock className="input-icon" />
                      <input
                        type={showActPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Re-enter passcode"
                        value={actConfirmPw}
                        onChange={e => setActConfirmPw(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleActivateStudent()}
                      />
                    </div>
                  </div>

                  {(actErr || hookErr) && <div className={styles.error}>{actErr || hookErr}</div>}

                  <button
                    className={`btn btn-accent ${styles.loginBtn}`}
                    onClick={handleActivateStudent}
                    disabled={isActivating}
                  >
                    {isActivating ? <span className="spinner" /> : null}
                    {isActivating ? 'Activating Account...' : 'Activate & Create Credentials'}
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Standard Candidate Login Mode */
            <>
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
                <code>CS2021001 / student123</code>
              </div>

              {actSuccessMsg && (
                <div className={styles.successAlert}>
                  <MdCheckCircle /> {actSuccessMsg}
                </div>
              )}

              <div className={styles.fields}>
                <div className="form-group">
                  <label className="form-label">Student / Candidate ID</label>
                  <div className="input-wrapper">
                    <MdPerson className="input-icon" />
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS2021001"
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

                <div className={styles.activationPrompt}>
                  First time here?{' '}
                  <button
                    type="button"
                    className={styles.activateLink}
                    onClick={() => {
                      setIsActivatingAccount(true);
                      setActStep(1);
                      setActErr('');
                      setActSuccessMsg('');
                      clearErrors();
                    }}
                  >
                    Activate Account
                  </button>
                </div>
              </div>
            </>
          )}
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
