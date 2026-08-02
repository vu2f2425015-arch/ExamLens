import Navbar from '../../components/Navbar/Navbar';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import styles from './StudentDashboard.module.css';
import exams from '../../data/exams.json';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDate, formatMinutes } from '../../utils/formatters';
import {
  MdQuiz, MdPlayCircle, MdCheckCircle, MdTrendingUp,
  MdCalendarToday, MdTimer, MdPerson, MdArrowForward
} from 'react-icons/md';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const upcoming = exams.filter(e => e.status === 'upcoming');
  const active   = exams.filter(e => e.status === 'active');
  const done     = exams.filter(e => e.status === 'completed');

  return (
    <>
      <Navbar title="Home" />
      <main className="page-body">
        {/* Welcome Banner */}
        <motion.div
          className={styles.welcome}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.welcomeLeft}>
            <div className={styles.welcomeAvatar}>
              {user?.name?.split(' ').map(n => n[0]).join('').slice(0,2)}
            </div>
            <div>
              <div className={styles.welcomeText}>Welcome back,</div>
              <h2 className={styles.welcomeName}>{user?.name}</h2>
              <div className={styles.welcomeSub}>
                {user?.department} · Semester {user?.semester} · {user?.rollNumber}
              </div>
            </div>
          </div>
          <div className={styles.welcomeRight}>
            <span className="badge badge-accent">Academic Year 2026-27</span>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className={styles.statsGrid}>
          <DashboardCard title="Upcoming Exams"  value={upcoming.length} icon={MdCalendarToday} color="info"      index={0} />
          <DashboardCard title="Active Now"       value={active.length}   icon={MdPlayCircle}   color="accent"    index={1} subtitle="Join immediately" />
          <DashboardCard title="Completed"        value={done.length}     icon={MdCheckCircle}  color="primary"   index={2} />
          <DashboardCard title="Average Score"    value="79%"             icon={MdTrendingUp}   color="secondary" index={3} trend="+4%" trendUp />
        </div>

        {/* Active Exams Alert */}
        {active.length > 0 && (
          <motion.div
            className={styles.activeAlert}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.alertDot} />
            <div>
              <div className={styles.alertTitle}>You have {active.length} active exam{active.length > 1 ? 's' : ''}!</div>
              <div className={styles.alertSub}>Please join immediately before time runs out.</div>
            </div>
            <button className="btn btn-accent btn-sm" onClick={() => navigate('/student/ongoing')}>
              Join Now <MdArrowForward />
            </button>
          </motion.div>
        )}

        {/* Upcoming Exams */}
        <div style={{ marginTop: '1.5rem' }}>
          <h3 className={styles.sectionTitle}>Upcoming Exams</h3>
          <div className={styles.examGrid}>
            {upcoming.map((exam, i) => (
              <motion.div
                key={exam.id}
                className={styles.examCard}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
              >
                <div className={styles.examCardHeader}>
                  <span className="badge badge-info">Upcoming</span>
                  <span className={styles.examDuration}><MdTimer size={13} /> {formatMinutes(exam.duration)}</span>
                </div>
                <h4 className={styles.examName}>{exam.name}</h4>
                <p className={styles.examFaculty}>{exam.faculty}</p>
                <div className={styles.examDate}>
                  <MdCalendarToday size={13} />
                  {formatDate(exam.date)} · {exam.time}
                </div>
                <button className="btn btn-secondary btn-sm" disabled style={{ marginTop: '.5rem', width: '100%', justifyContent: 'center' }}>
                  Exam Not Started Yet
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
