import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';
import {
  MdDashboard,
  MdPeople,
  MdAssignment,
  MdMonitor,
  MdWarning,
  MdVideoLibrary,
  MdBarChart,
  MdSettings,
  MdLogout,
  MdHome,
  MdQuiz,
  MdPlayCircle,
  MdEmojiEvents,
  MdPerson,
  MdSecurity,
  MdClose,
  MdBadge,
  MdClass,
  MdAdd,
  MdCheckCircle,
  MdLibraryBooks,
  MdCloudUpload,
} from 'react-icons/md';

const adminLinks = [
  { to: '/admin/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/admin/students', icon: MdPeople, label: 'Students' },
  { to: '/admin/teachers', icon: MdBadge, label: 'Teachers' },
  { to: '/admin/divisions', icon: MdClass, label: 'Divisions' },
  { to: '/admin/exams', icon: MdAssignment, label: 'Exams' },
  { to: '/admin/live', icon: MdMonitor, label: 'Live Monitoring', badge: 'LIVE' },
  { to: '/admin/alerts', icon: MdWarning, label: 'AI Alerts' },
  { to: '/admin/recordings', icon: MdVideoLibrary, label: 'Recordings' },
  { to: '/admin/reports', icon: MdBarChart, label: 'Reports' },
  { to: '/admin/settings', icon: MdSettings, label: 'Settings' },
];

const teacherLinks = [
  { to: '/teacher/dashboard', icon: MdDashboard, label: 'Dashboard' },
  { to: '/teacher/divisions', icon: MdClass, label: 'My Divisions' },
  { to: '/teacher/exams', icon: MdAssignment, label: 'My Exams' },
  { to: '/teacher/exams/new', icon: MdAdd, label: 'Assign Exam' },
  { to: '/teacher/questions', icon: MdLibraryBooks, label: 'Question Bank' },
  { to: '/teacher/questions/upload', icon: MdCloudUpload, label: 'Upload Questions' },
  { to: '/teacher/attendance', icon: MdCheckCircle, label: 'Attendance' },
  { to: '/teacher/alerts', icon: MdWarning, label: 'Alerts & Monitoring' },
  { to: '/teacher/results', icon: MdBarChart, label: 'Results' },
  { to: '/teacher/profile', icon: MdPerson, label: 'Profile' },
];

const studentLinks = [
  { to: '/student/dashboard', icon: MdHome, label: 'Home' },
  { to: '/student/exams', icon: MdQuiz, label: 'My Exams' },
  { to: '/student/ongoing', icon: MdPlayCircle, label: 'Ongoing Exams' },
  { to: '/student/results', icon: MdEmojiEvents, label: 'Results' },
  { to: '/student/profile', icon: MdPerson, label: 'Profile' },
];

export default function Sidebar() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const links = role === 'admin' ? adminLinks : role === 'teacher' ? teacherLinks : studentLinks;

  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    const handleClose = () => setIsMobileOpen(false);

    window.addEventListener('toggle-mobile-sidebar', handleToggle);
    window.addEventListener('close-mobile-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggle);
      window.removeEventListener('close-mobile-sidebar', handleClose);
    };
  }, []);

  const handleLogout = () => {
    setIsMobileOpen(false);
    logout();
    navigate('/');
  };

  const handleNavItemClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside className={`${styles.sidebar} ${isMobileOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.logoRow}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <MdSecurity />
            </div>
            <div>
              <div className={styles.logoText}>ExamLens</div>
              <div className={styles.logoSub}>
                {role === 'admin' ? 'AUTHORITY DESK' : role === 'teacher' ? 'FACULTY DESK' : 'CANDIDATE DESK'}
              </div>
            </div>
          </div>
          <button
            className={styles.mobileCloseBtn}
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close Sidebar"
          >
            <MdClose />
          </button>
        </div>

        <div className={styles.divider} />

        {(() => {
          const displayName = user?.name || (role === 'admin' ? 'Dr. Administrator' : role === 'teacher' ? 'Faculty Member' : 'Student Candidate');
          const nameParts = displayName.split(/\s+/).filter(Boolean);
          const initials = (nameParts.map((n) => n[0]).join('') || 'FA').toUpperCase().slice(0, 2);
          const shortName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0] || 'User';

          return (
            <div className={styles.userInfo}>
              <div className={styles.avatar}>{initials}</div>
              <div className={styles.userDetails}>
                <div className={styles.userName}>{shortName}</div>
                <div className={styles.userRole}>
                  {role === 'admin'
                    ? 'Administrator'
                    : role === 'teacher'
                    ? 'Faculty Member'
                    : `Semester ${user?.semester || '4'}`}
                </div>
              </div>
              <div className={styles.onlineDot} />
            </div>
          );
        })()}

        <div className={styles.divider} />

        <nav className={styles.nav}>
          <div className={styles.navLabel}>
            {role === 'admin' ? 'Admin Panel' : role === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
          </div>
          {links.map(({ to, icon: Icon, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={handleNavItemClick}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>
                <Icon />
              </span>
              <span className={styles.navLabel2}>{label}</span>
              {badge && <span className={styles.liveBadge}>{badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.spacer} />

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <MdLogout />
          <span>Logout</span>
        </button>
      </aside>
    </>
  );
}
