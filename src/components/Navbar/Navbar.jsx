import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getCurrentDateTime, getInitials } from '../../utils/formatters';
import styles from './Navbar.module.css';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import {
  MdNotifications, MdSearch, MdKeyboardArrowDown,
  MdDashboard, MdLogout, MdSettings, MdPerson, MdMenu
} from 'react-icons/md';

export default function Navbar({ title }) {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const [dateTime, setDateTime] = useState(getCurrentDateTime());
  const [notifications] = useState(3);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => setDateTime(getCurrentDateTime()), 60000);
    return () => clearInterval(id);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new Event('toggle-mobile-sidebar'));
  };

  return (
    <header className={styles.navbar}>
      {/* Page Title & Mobile Menu Toggle */}
      <div className={styles.left}>
        <button
          className={styles.mobileMenuBtn}
          onClick={toggleMobileSidebar}
          aria-label="Open Mobile Menu"
        >
          <MdMenu />
        </button>
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
        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            className={styles.profile}
            onClick={() => setShowProfile(v => !v)}
            aria-expanded={showProfile}
          >
            <div className={styles.profileAvatar}>
              {getInitials(user?.name || 'Admin')}
            </div>
            <div className={styles.profileInfo}>
              <div className={styles.profileName}>{user?.name || 'Dr. Administrator'}</div>
              <div className={styles.profileRole}>
                {role === 'admin' ? 'Administrator' : 'Student'}
              </div>
            </div>
            <MdKeyboardArrowDown
              className={styles.chevron}
              style={{ transform: showProfile ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            />
          </button>

          {showProfile && (
            <div className={styles.profileDropdown}>
              <div className={styles.profileHeader}>
                <div className={styles.dropdownAvatar}>{getInitials(user?.name || 'Admin')}</div>
                <div>
                  <div className={styles.dropdownName}>{user?.name || 'Dr. Administrator'}</div>
                  <div className={styles.dropdownEmail}>{user?.email || (role === 'admin' ? 'admin@examlens.edu' : 'student@examlens.edu')}</div>
                </div>
              </div>
              <div className={styles.dropdownMenu}>
                {role === 'admin' ? (
                  <>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { navigate('/admin/settings'); setShowProfile(false); }}
                    >
                      <MdSettings /> System Settings
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { navigate('/admin/dashboard'); setShowProfile(false); }}
                    >
                      <MdPerson /> Proctor Desk
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { navigate('/student/profile'); setShowProfile(false); }}
                    >
                      <MdPerson /> My Profile
                    </button>
                    <button
                      className={styles.dropdownItem}
                      onClick={() => { navigate('/student/dashboard'); setShowProfile(false); }}
                    >
                      <MdPerson /> Student Dashboard
                    </button>
                  </>
                )}
                <div className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.danger}`}
                  onClick={handleLogout}
                >
                  <MdLogout /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
