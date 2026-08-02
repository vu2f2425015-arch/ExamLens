import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Sidebar.module.css';
import {
  MdDashboard, MdPeople, MdAssignment, MdMonitor, MdWarning,
  MdVideoLibrary, MdBarChart, MdSettings, MdLogout,
  MdHome, MdQuiz, MdPlayCircle, MdEmojiEvents, MdPerson,
  MdSecurity
} from 'react-icons/md';

const adminLinks = [
  { to: '/admin/dashboard',  icon: MdDashboard,    label: 'Dashboard' },
  { to: '/admin/students',   icon: MdPeople,       label: 'Students' },
  { to: '/admin/exams',      icon: MdAssignment,   label: 'Exams' },
  { to: '/admin/live',       icon: MdMonitor,      label: 'Live Monitoring', badge: 'LIVE' },
  { to: '/admin/alerts',     icon: MdWarning,      label: 'AI Alerts' },
  { to: '/admin/recordings', icon: MdVideoLibrary, label: 'Recordings' },
  { to: '/admin/reports',    icon: MdBarChart,     label: 'Reports' },
  { to: '/admin/settings',   icon: MdSettings,     label: 'Settings' },
];

const studentLinks = [
  { to: '/student/dashboard', icon: MdHome,       label: 'Home' },
  { to: '/student/exams',     icon: MdQuiz,       label: 'My Exams' },
  { to: '/student/ongoing',   icon: MdPlayCircle, label: 'Ongoing Exams' },
  { to: '/student/results',   icon: MdEmojiEvents,label: 'Results' },
  { to: '/student/profile',   icon: MdPerson,     label: 'Profile' },
];

export default function Sidebar() {
  const { role, user, logout } = useAuth();
  const navigate = useNavigate();
  const links = role === 'admin' ? adminLinks : studentLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoIcon}>
          <MdSecurity />
        </div>
        <div>
          <div className={styles.logoText}>ExamLens</div>
          <div className={styles.logoSub}>AUTHORITY DESK</div>
        </div>
      </div>

      <div className={styles.divider} />

      {/* User info */}
      <div className={styles.userInfo}>
        <div className={styles.avatar}>
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
        </div>
        <div className={styles.userDetails}>
          <div className={styles.userName}>{user?.name?.split(' ')[0]} {user?.name?.split(' ')[1]?.[0]}.</div>
          <div className={styles.userRole}>{role === 'admin' ? 'Administrator' : `Semester ${user?.semester}`}</div>
        </div>
        <div className={styles.onlineDot} />
      </div>

      <div className={styles.divider} />

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navLabel}>
          {role === 'admin' ? 'Admin Panel' : 'Student Portal'}
        </div>
        {links.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.navIcon}><Icon /></span>
            <span className={styles.navLabel2}>{label}</span>
            {badge && <span className={styles.liveBadge}>{badge}</span>}
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      {/* Logout */}
      <button className={styles.logoutBtn} onClick={handleLogout}>
        <MdLogout />
        <span>Logout</span>
      </button>
    </aside>
  );
}
