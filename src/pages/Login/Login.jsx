import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudentActivation } from '../../hooks/useStudentActivation';
import { useTeacherActivation } from '../../hooks/useTeacherActivation';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import styles from './Login.module.css';
import {
  MdSecurity,
  MdPerson,
  MdLock,
  MdAdminPanelSettings,
  MdSchool,
  MdBadge,
  MdVisibility,
  MdVisibilityOff,
  MdEmail,
  MdCheckCircle,
  MdArrowBack,
} from 'react-icons/md';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('student'); // 'student' | 'teacher' | 'admin'

  const {
    verifyStudent,
    activateStudent,
    isVerifying: isVerifyingStudent,
    isActivating: isActivatingStudent,
    error: studentHookErr,
    clearErrors: clearStudentErrors,
  } = useStudentActivation();

  const {
    verifyTeacher,
    activateTeacher,
    isVerifying: isVerifyingTeacher,
    isActivating: isActivatingTeacher,
    error: teacherHookErr,
    clearErrors: clearTeacherErrors,
  } = useTeacherActivation();

  // Credentials State
  const [adminCreds, setAdminCreds] = useState({ id: '', password: '' });
  const [studentCreds, setStudentCreds] = useState({ id: '', password: '' });
  const [teacherCreds, setTeacherCreds] = useState({ id: '', password: '' });

  const [adminErr, setAdminErr] = useState('');
  const [studentErr, setStudentErr] = useState('');
  const [teacherErr, setTeacherErr] = useState('');

  const [showAdminPw, setShowAdminPw] = useState(false);
  const [showStudPw, setShowStudPw] = useState(false);
  const [showTchPw, setShowTchPw] = useState(false);
  const [loading, setLoading] = useState(null); // 'admin' | 'student' | 'teacher'

  // Student Activation UI State
  const [isActivatingStudentAccount, setIsActivatingStudentAccount] = useState(false);
  const [actStudentStep, setActStudentStep] = useState(1);
  const [actRoll, setActRoll] = useState('');
  const [actStudentEmail, setActStudentEmail] = useState('');
  const [actStudentPassword, setActStudentPassword] = useState('');
  const [actStudentConfirmPw, setActStudentConfirmPw] = useState('');
  const [showActStudentPw, setShowActStudentPw] = useState(false);
  const [verifiedStudent, setVerifiedStudent] = useState(null);
  const [actStudentErr, setActStudentErr] = useState('');
  const [actStudentSuccessMsg, setActStudentSuccessMsg] = useState('');

  // Teacher Activation UI State
  const [isActivatingTeacherAccount, setIsActivatingTeacherAccount] = useState(false);
  const [actTeacherStep, setActTeacherStep] = useState(1);
  const [actEmpId, setActEmpId] = useState('');
  const [actTeacherEmail, setActTeacherEmail] = useState('');
  const [actTeacherPassword, setActTeacherPassword] = useState('');
  const [actTeacherConfirmPw, setActTeacherConfirmPw] = useState('');
  const [showActTeacherPw, setShowActTeacherPw] = useState(false);
  const [verifiedTeacher, setVerifiedTeacher] = useState(null);
  const [actTeacherErr, setActTeacherErr] = useState('');
  const [actTeacherSuccessMsg, setActTeacherSuccessMsg] = useState('');

  const handleLogin = async (role) => {
    let creds = studentCreds;
    if (role === 'admin') creds = adminCreds;
    if (role === 'teacher') creds = teacherCreds;

    setLoading(role);
    setAdminErr('');
    setStudentErr('');
    setTeacherErr('');

    try {
      const result = await login(role, creds);
      setLoading(null);
      if (result.success) {
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'teacher') navigate('/teacher/dashboard');
        else navigate('/student/dashboard');
      } else {
        if (role === 'admin') setAdminErr(result.error);
        else if (role === 'teacher') setTeacherErr(result.error);
        else setStudentErr(result.error);
      }
    } catch (err) {
      setLoading(null);
      const msg = err.message || 'Login failed.';
      if (role === 'admin') setAdminErr(msg);
      else if (role === 'teacher') setTeacherErr(msg);
      else setStudentErr(msg);
    }
  };

  // Student Verification & Activation Handlers
  const handleVerifyStudent = async () => {
    setActStudentErr('');
    setActStudentSuccessMsg('');
    if (!actRoll || !actStudentEmail) {
      setActStudentErr('Please enter both Roll Number and Official Email.');
      return;
    }
    try {
      const res = await verifyStudent(actRoll, actStudentEmail);
      if (res.status === 'not_found') {
        setActStudentErr('No matching roster record found for this roll number and email.');
      } else if (res.status === 'already_activated') {
        setActStudentErr('This account is already activated. Log in directly.');
      } else if (res.status === 'found') {
        setVerifiedStudent(res.student);
        setActStudentStep(2);
      }
    } catch (err) {
      setActStudentErr(err.message || 'Verification failed.');
    }
  };

  const handleActivateStudent = async () => {
    setActStudentErr('');
    if (!actStudentPassword) {
      setActStudentErr('Please enter a passcode.');
      return;
    }
    if (actStudentPassword !== actStudentConfirmPw) {
      setActStudentErr('Passcodes do not match.');
      return;
    }
    try {
      await activateStudent(actRoll, actStudentPassword);
      setStudentCreds({ id: actRoll, password: actStudentPassword });
      setActStudentSuccessMsg(`Account for ${verifiedStudent.name} (${actRoll}) activated! Credentials pre-filled.`);
      setIsActivatingStudentAccount(false);
      setActStudentStep(1);
      setActRoll('');
      setActStudentEmail('');
      setActStudentPassword('');
      setActStudentConfirmPw('');
      setVerifiedStudent(null);
    } catch (err) {
      setActStudentErr(err.message || 'Activation failed.');
    }
  };

  // Teacher Verification & Activation Handlers
  const handleVerifyTeacher = async () => {
    setActTeacherErr('');
    setActTeacherSuccessMsg('');
    if (!actEmpId || !actTeacherEmail) {
      setActTeacherErr('Please enter both Employee ID and Official Email.');
      return;
    }
    try {
      const res = await verifyTeacher(actEmpId, actTeacherEmail);
      if (res.status === 'not_found') {
        setActTeacherErr('No matching faculty record found for this Employee ID and Email.');
      } else if (res.status === 'already_activated') {
        setActTeacherErr('This account is already activated. Log in directly.');
      } else if (res.status === 'found') {
        setVerifiedTeacher(res.teacher);
        setActTeacherStep(2);
      }
    } catch (err) {
      setActTeacherErr(err.message || 'Verification failed.');
    }
  };

  const handleActivateTeacher = async () => {
    setActTeacherErr('');
    if (!actTeacherPassword) {
      setActTeacherErr('Please enter a password.');
      return;
    }
    if (actTeacherPassword !== actTeacherConfirmPw) {
      setActTeacherErr('Passwords do not match.');
      return;
    }
    try {
      await activateTeacher(actEmpId, actTeacherPassword);
      setTeacherCreds({ id: actEmpId, password: actTeacherPassword });
      setActTeacherSuccessMsg(`Faculty account for ${verifiedTeacher.name} activated! Credentials pre-filled.`);
      setIsActivatingTeacherAccount(false);
      setActTeacherStep(1);
      setActEmpId('');
      setActTeacherEmail('');
      setActTeacherPassword('');
      setActTeacherConfirmPw('');
      setVerifiedTeacher(null);
    } catch (err) {
      setActTeacherErr(err.message || 'Faculty activation failed.');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <ThemeToggle />
      </div>

      <div className={styles.bg} />

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

      {/* Desk Selection Tabs */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.portalTab} ${activeTab === 'student' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('student')}
        >
          <MdSchool /> Candidate Entry
        </button>
        <button
          className={`${styles.portalTab} ${activeTab === 'teacher' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('teacher')}
        >
          <MdBadge /> Faculty Desk
        </button>
        <button
          className={`${styles.portalTab} ${activeTab === 'admin' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('admin')}
        >
          <MdAdminPanelSettings /> Proctor & Admin
        </button>
      </div>

      {/* Active Desk Portal Cards */}
      <div className={styles.cards}>
        {activeTab === 'student' && (
          <div className={`${styles.card} ${styles.studentCard}`}>
            {isActivatingStudentAccount ? (
              <>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setIsActivatingStudentAccount(false);
                    clearStudentErrors();
                  }}
                >
                  <MdArrowBack /> Back to Candidate Entry
                </button>

                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.studentIcon}`}>
                    <MdSchool />
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>Student Account Activation</h2>
                    <p className={styles.cardSub}>
                      {actStudentStep === 1 ? 'Step 1: Verify roster record' : 'Step 2: Set access passcode'}
                    </p>
                  </div>
                </div>

                {actStudentStep === 1 ? (
                  <div className={styles.fields}>
                    <div className="form-group">
                      <label className="form-label">Roll Number / Student ID</label>
                      <div className="input-wrapper">
                        <MdPerson className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. CS2021001"
                          value={actRoll}
                          onChange={(e) => setActRoll(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Official Email</label>
                      <div className="input-wrapper">
                        <MdEmail className="input-icon" />
                        <input
                          type="email"
                          className="form-input"
                          placeholder="e.g. arjun.sharma@examlens.edu"
                          value={actStudentEmail}
                          onChange={(e) => setActStudentEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {(actStudentErr || studentHookErr) && (
                      <div className={styles.error}>{actStudentErr || studentHookErr}</div>
                    )}

                    <button
                      className={`btn btn-accent ${styles.loginBtn}`}
                      onClick={handleVerifyStudent}
                      disabled={isVerifyingStudent}
                    >
                      {isVerifyingStudent ? 'Verifying Roster Record...' : 'Verify Student Record'}
                    </button>
                  </div>
                ) : (
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
                      <label className="form-label">Create Passcode</label>
                      <div className={`input-wrapper ${styles.pwWrapper}`}>
                        <MdLock className="input-icon" />
                        <input
                          type={showActStudentPw ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Min 8 chars, 1 number"
                          value={actStudentPassword}
                          onChange={(e) => setActStudentPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowActStudentPw((v) => !v)}
                        >
                          {showActStudentPw ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Passcode</label>
                      <div className="input-wrapper">
                        <MdLock className="input-icon" />
                        <input
                          type={showActStudentPw ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Re-enter passcode"
                          value={actStudentConfirmPw}
                          onChange={(e) => setActStudentConfirmPw(e.target.value)}
                        />
                      </div>
                    </div>

                    {(actStudentErr || studentHookErr) && (
                      <div className={styles.error}>{actStudentErr || studentHookErr}</div>
                    )}

                    <button
                      className={`btn btn-accent ${styles.loginBtn}`}
                      onClick={handleActivateStudent}
                      disabled={isActivatingStudent}
                    >
                      {isActivatingStudent ? 'Activating...' : 'Activate Student Account'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.studentIcon}`}>
                    <MdSchool />
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>Candidate Entry Desk</h2>
                    <p className={styles.cardSub}>Student examination portal access</p>
                  </div>
                </div>

                <div className={styles.demoHint}>
                  <span>DEMO CANDIDATE: </span>
                  <code>CS2021001 / student123</code>
                </div>

                {actStudentSuccessMsg && (
                  <div className={styles.successAlert}>
                    <MdCheckCircle /> {actStudentSuccessMsg}
                  </div>
                )}

                <div className={styles.fields}>
                  <div className="form-group">
                    <label className="form-label">Roll Number / Student ID</label>
                    <div className="input-wrapper">
                      <MdPerson className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. CS2021001"
                        value={studentCreds.id}
                        onChange={(e) => setStudentCreds((p) => ({ ...p, id: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin('student')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Passcode</label>
                    <div className={`input-wrapper ${styles.pwWrapper}`}>
                      <MdLock className="input-icon" />
                      <input
                        type={showStudPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Enter passcode"
                        value={studentCreds.password}
                        onChange={(e) => setStudentCreds((p) => ({ ...p, password: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin('student')}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowStudPw((v) => !v)}
                      >
                        {showStudPw ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>

                  {studentErr && <div className={styles.error}>{studentErr}</div>}

                  <button
                    className={`btn btn-accent ${styles.loginBtn}`}
                    onClick={() => handleLogin('student')}
                    disabled={loading === 'student'}
                  >
                    {loading === 'student' ? 'Authenticating...' : 'Enter Examination Hall'}
                  </button>

                  <div className={styles.activationPrompt}>
                    First time candidate?{' '}
                    <button
                      type="button"
                      className={styles.activateLink}
                      onClick={() => {
                        setIsActivatingStudentAccount(true);
                        setActStudentStep(1);
                        setActStudentErr('');
                      }}
                    >
                      Activate Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'teacher' && (
          <div className={`${styles.card} ${styles.teacherCard}`}>
            {isActivatingTeacherAccount ? (
              <>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => {
                    setIsActivatingTeacherAccount(false);
                    clearTeacherErrors();
                  }}
                >
                  <MdArrowBack /> Back to Faculty Desk
                </button>

                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.teacherIcon}`}>
                    <MdBadge />
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>Faculty Account Activation</h2>
                    <p className={styles.cardSub}>
                      {actTeacherStep === 1 ? 'Step 1: Verify employee ID' : 'Step 2: Set access password'}
                    </p>
                  </div>
                </div>

                {actTeacherStep === 1 ? (
                  <div className={styles.fields}>
                    <div className="form-group">
                      <label className="form-label">Employee ID</label>
                      <div className="input-wrapper">
                        <MdBadge className="input-icon" />
                        <input
                          type="text"
                          className="form-input"
                          placeholder="e.g. FAC2026001"
                          value={actEmpId}
                          onChange={(e) => setActEmpId(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Official Faculty Email</label>
                      <div className="input-wrapper">
                        <MdEmail className="input-icon" />
                        <input
                          type="email"
                          className="form-input"
                          placeholder="e.g. meera.iyer@examlens.edu"
                          value={actTeacherEmail}
                          onChange={(e) => setActTeacherEmail(e.target.value)}
                        />
                      </div>
                    </div>

                    {(actTeacherErr || teacherHookErr) && (
                      <div className={styles.error}>{actTeacherErr || teacherHookErr}</div>
                    )}

                    <button
                      className={`btn btn-primary ${styles.loginBtn}`}
                      onClick={handleVerifyTeacher}
                      disabled={isVerifyingTeacher}
                    >
                      {isVerifyingTeacher ? 'Verifying Faculty Record...' : 'Verify Faculty Record'}
                    </button>
                  </div>
                ) : (
                  <div className={styles.fields}>
                    {verifiedTeacher && (
                      <div className={styles.studentBadge}>
                        <div className={styles.badgeHeader}>
                          <MdCheckCircle /> Faculty Record Verified
                        </div>
                        <div className={styles.badgeName}>{verifiedTeacher.name}</div>
                        <div className={styles.badgeMeta}>
                          {verifiedTeacher.department} • {verifiedTeacher.employeeId}
                        </div>
                      </div>
                    )}

                    <div className="form-group">
                      <label className="form-label">Create Faculty Password</label>
                      <div className={`input-wrapper ${styles.pwWrapper}`}>
                        <MdLock className="input-icon" />
                        <input
                          type={showActTeacherPw ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Min 8 chars, 1 number"
                          value={actTeacherPassword}
                          onChange={(e) => setActTeacherPassword(e.target.value)}
                        />
                        <button
                          type="button"
                          className={styles.eyeBtn}
                          onClick={() => setShowActTeacherPw((v) => !v)}
                        >
                          {showActTeacherPw ? <MdVisibilityOff /> : <MdVisibility />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <div className="input-wrapper">
                        <MdLock className="input-icon" />
                        <input
                          type={showActTeacherPw ? 'text' : 'password'}
                          className="form-input"
                          placeholder="Re-enter password"
                          value={actTeacherConfirmPw}
                          onChange={(e) => setActTeacherConfirmPw(e.target.value)}
                        />
                      </div>
                    </div>

                    {(actTeacherErr || teacherHookErr) && (
                      <div className={styles.error}>{actTeacherErr || teacherHookErr}</div>
                    )}

                    <button
                      className={`btn btn-primary ${styles.loginBtn}`}
                      onClick={handleActivateTeacher}
                      disabled={isActivatingTeacher}
                    >
                      {isActivatingTeacher ? 'Activating...' : 'Activate Faculty Account'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className={styles.cardHeader}>
                  <div className={`${styles.cardIcon} ${styles.teacherIcon}`}>
                    <MdBadge />
                  </div>
                  <div>
                    <h2 className={styles.cardTitle}>Faculty Desk</h2>
                    <p className={styles.cardSub}>Teacher and division management portal</p>
                  </div>
                </div>

                <div className={styles.demoHint}>
                  <span>DEMO FACULTY: </span>
                  <code>FAC2026001 / student123</code>
                </div>

                {actTeacherSuccessMsg && (
                  <div className={styles.successAlert}>
                    <MdCheckCircle /> {actTeacherSuccessMsg}
                  </div>
                )}

                <div className={styles.fields}>
                  <div className="form-group">
                    <label className="form-label">Faculty Employee ID / Email</label>
                    <div className="input-wrapper">
                      <MdBadge className="input-icon" />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. FAC2026001"
                        value={teacherCreds.id}
                        onChange={(e) => setTeacherCreds((p) => ({ ...p, id: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin('teacher')}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className={`input-wrapper ${styles.pwWrapper}`}>
                      <MdLock className="input-icon" />
                      <input
                        type={showTchPw ? 'text' : 'password'}
                        className="form-input"
                        placeholder="Enter password"
                        value={teacherCreds.password}
                        onChange={(e) => setTeacherCreds((p) => ({ ...p, password: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogin('teacher')}
                      />
                      <button
                        type="button"
                        className={styles.eyeBtn}
                        onClick={() => setShowTchPw((v) => !v)}
                      >
                        {showTchPw ? <MdVisibilityOff /> : <MdVisibility />}
                      </button>
                    </div>
                  </div>

                  {teacherErr && <div className={styles.error}>{teacherErr}</div>}

                  <button
                    className={`btn btn-primary ${styles.loginBtn}`}
                    onClick={() => handleLogin('teacher')}
                    disabled={loading === 'teacher'}
                  >
                    {loading === 'teacher' ? 'Authenticating...' : 'Enter Faculty Portal'}
                  </button>

                  <div className={styles.activationPrompt}>
                    First time faculty?{' '}
                    <button
                      type="button"
                      className={styles.activateLink}
                      onClick={() => {
                        setIsActivatingTeacherAccount(true);
                        setActTeacherStep(1);
                        setActTeacherErr('');
                      }}
                    >
                      Activate Account
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className={`${styles.card} ${styles.adminCard}`}>
            <div className={styles.cardHeader}>
              <div className={`${styles.cardIcon} ${styles.adminIcon}`}>
                <MdAdminPanelSettings />
              </div>
              <div>
                <h2 className={styles.cardTitle}>Proctor & Admin Desk</h2>
                <p className={styles.cardSub}>Institutional administration desk</p>
              </div>
            </div>

            <div className={styles.demoHint}>
              <span>DEMO CREDENTIALS: </span>
              <code>admin / admin123</code>
            </div>

            <div className={styles.fields}>
              <div className="form-group">
                <label className="form-label">Proctor ID / Admin NetID</label>
                <div className="input-wrapper">
                  <MdAdminPanelSettings className="input-icon" />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. admin"
                    value={adminCreds.id}
                    onChange={(e) => setAdminCreds((p) => ({ ...p, id: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin('admin')}
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
                    onChange={(e) => setAdminCreds((p) => ({ ...p, password: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin('admin')}
                  />
                  <button
                    type="button"
                    className={styles.eyeBtn}
                    onClick={() => setShowAdminPw((v) => !v)}
                  >
                    {showAdminPw ? <MdVisibilityOff /> : <MdVisibility />}
                  </button>
                </div>
              </div>

              {adminErr && <div className={styles.error}>{adminErr}</div>}

              <button
                className={`btn btn-primary ${styles.loginBtn}`}
                onClick={() => handleLogin('admin')}
                disabled={loading === 'admin'}
              >
                {loading === 'admin' ? 'Authenticating...' : 'Log In to Proctor Desk'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        ExamLens Institutional Portal • University Examination & Integrity System • Academic Year 2026-2027
      </div>
    </div>
  );
}
