import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getCurrentDateTime, getInitials } from '../../utils/formatters';
import styles from './Navbar.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import {
  MdNotifications, MdSearch, MdCircle, MdKeyboardArrowDown,
  MdDashboard
} from 'react-icons/md';

export default function Navbar({ title }) {
  const { user, role } = useAuth();
  const [dateTime, setDateTime] = useState(getCurrentDateTime());
  const [notifications] = useState(3);
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setDateTime(getCurrentDateTime()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <header className={styles.navbar}>
      {/* Page Title */}
      <div className={styles.left}>
        <div className={styles.breadcrumb}>
          <MdDashboard className={styles.breadcrumbIcon} />
          <span className={styles.pageTitle}>{title || 'Dashboard'}</span>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrapper}>
        <MdSearch className={styles.searchIcon} />
        <input
          type="text"
          placeholder="Search students, exams..."
          className={styles.searchInput}
        />
      </div>

      {/* Right */}
      <div className={styles.right}>
        {/* Date */}
        <div className={styles.dateTime}>{dateTime}</div>

        {/* System Status */}
        <div className={styles.systemStatus}>
          <span className={styles.statusDot} />
          <span>SYSTEM OPERATIONAL</span>
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <div className={styles.notifWrapper}>
          <button
            className={styles.notifBtn}
            onClick={() => setShowNotif(v => !v)}
          >
            <MdNotifications />
            {notifications > 0 && (
              <span className={styles.notifBadge}>{notifications}</span>
            )}
          </button>
          {showNotif && (
            <div className={styles.notifDropdown}>
              <div className={styles.notifHeader}>Notifications</div>
              {[
                { msg: 'Multiple faces detected — Arjun Sharma', time: '2m ago', type: 'danger' },
                { msg: 'DBMS Exam started — 38 students active', time: '5m ago', type: 'info' },
                { msg: 'Exam EX003 results published', time: '1h ago', type: 'accent' },
              ].map((n, i) => (
                <div key={i} className={`${styles.notifItem} ${styles[n.type]}`}>
                  <div className={styles.notifMsg}>{n.msg}</div>
                  <div className={styles.notifTime}>{n.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.profileAvatar}>
            {getInitials(user?.name || 'U')}
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.profileName}>{user?.name?.split(' ')[0]}</div>
            <div className={styles.profileRole}>
              {role === 'admin' ? 'Administrator' : 'Student'}
            </div>
          </div>
          <MdKeyboardArrowDown className={styles.chevron} />
        </div>
      </div>
    </header>
  );
}
