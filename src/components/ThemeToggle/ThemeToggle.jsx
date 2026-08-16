import { useTheme } from '../../context/ThemeContext';
import styles from './ThemeToggle.module.css';
import { MdLightMode, MdDarkMode } from 'react-icons/md';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      className={styles.toggle}
      onClick={toggle}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <span className={styles.track}>
        <span className={`${styles.thumb} ${theme === 'dark' ? styles.thumbDark : ''}`}>
          {theme === 'light'
            ? <MdLightMode className={styles.icon} />
            : <MdDarkMode className={styles.icon} />
          }
        </span>
      </span>
      <span className={styles.label}>
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>
    </button>
  );
}
