import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import styles from './Attendance.module.css';
import {
  MdCheckCircle, MdCancel, MdAccessTime, MdCalendarToday, MdDownload,
  MdFilterList, MdSearch, MdAdd, MdEdit, MdDelete
} from 'react-icons/md';

export default function Attendance() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Mock attendance data
  const attendanceData = [
    { id: 'ATT_001', studentName: 'Arjun Sharma', rollNumber: 'CS2021001', date: '2026-08-16', status: 'Present', time: '10:05 AM', subject: 'Data Structures' },
    { id: 'ATT_002', studentName: 'Priya Mehta', rollNumber: 'CS2021002', date: '2026-08-16', status: 'Present', time: '10:08 AM', subject: 'Data Structures' },
    { id: 'ATT_003', studentName: 'Rohan Verma', rollNumber: 'CS2021003', date: '2026-08-16', status: 'Absent', time: null, subject: 'Data Structures' },
    { id: 'ATT_004', studentName: 'Isha Patel', rollNumber: 'CS2021004', date: '2026-08-16', status: 'Late', time: '10:35 AM', subject: 'Data Structures' },
    { id: 'ATT_005', studentName: 'Karan Singh', rollNumber: 'CS2021005', date: '2026-08-16', status: 'Present', time: '10:02 AM', subject: 'Data Structures' },
    { id: 'ATT_006', studentName: 'Maya Desai', rollNumber: 'EC2021001', date: '2026-08-16', status: 'Present', time: '09:58 AM', subject: 'Digital Signal Processing' },
    { id: 'ATT_007', studentName: 'Aditya Kumar', rollNumber: 'EC2021002', date: '2026-08-16', status: 'Absent', time: null, subject: 'Digital Signal Processing' },
  ];

  const [attendance, setAttendance] = useState(attendanceData);
  const [filteredAttendance, setFilteredAttendance] = useState(attendanceData);
  const [selectedDate, setSelectedDate] = useState('2026-08-16');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('');

  // Calculate statistics
  const presentCount = attendance.filter((a) => a.status === 'Present').length;
  const absentCount = attendance.filter((a) => a.status === 'Absent').length;
  const lateCount = attendance.filter((a) => a.status === 'Late').length;
  const totalRecords = attendance.length;
  const attendancePercentage = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const subjects = ['All', ...new Set(attendance.map((a) => a.subject))];

  // Filter attendance records
  useEffect(() => {
    let filtered = attendance;

    if (selectedDate) {
      filtered = filtered.filter((a) => a.date === selectedDate);
    }

    if (selectedSubject !== 'All') {
      filtered = filtered.filter((a) => a.subject === selectedSubject);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAttendance(filtered);
  }, [selectedDate, selectedSubject, searchTerm, attendance]);

  const handleStatusChange = (id, newStatus) => {
    setAttendance((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: newStatus,
              time: newStatus === 'Absent' ? null : a.time || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            }
          : a
      )
    );
    setEditingId(null);
  };

  const handleDeleteRecord = (id) => {
    setAttendance((prev) => prev.filter((a) => a.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Present':
        return '#10b981';
      case 'Absent':
        return '#ef4444';
      case 'Late':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Present':
        return <MdCheckCircle />;
      case 'Absent':
        return <MdCancel />;
      case 'Late':
        return <MdAccessTime />;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar title="Attendance Management" />
      <main className="page-body">
        <div className={styles.container}>
          {/* Header Section */}
          <div className={styles.header}>
            <div>
              <h1 className={styles.pageTitle}>Attendance Management</h1>
              <p className={styles.pageSubtitle}>Track and manage student attendance records</p>
            </div>
            <button className={`${styles.btn} ${styles.btnPrimary}`}>
              <MdAdd /> Mark Attendance
            </button>
          </div>

          {/* Statistics Cards */}
          <div className={styles.statsGrid}>
            <div className={`${styles.statCard} ${isDark ? styles.dark : ''}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                <MdCheckCircle size={24} style={{ color: '#10b981' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Present</p>
                <p className={styles.statValue}>{presentCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${isDark ? styles.dark : ''}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fee2e2' }}>
                <MdCancel size={24} style={{ color: '#ef4444' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Absent</p>
                <p className={styles.statValue}>{absentCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${isDark ? styles.dark : ''}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#fef3c7' }}>
                <MdAccessTime size={24} style={{ color: '#f59e0b' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Late</p>
                <p className={styles.statValue}>{lateCount}</p>
              </div>
            </div>

            <div className={`${styles.statCard} ${isDark ? styles.dark : ''}`}>
              <div className={styles.statIcon} style={{ backgroundColor: '#dbeafe' }}>
                <MdCheckCircle size={24} style={{ color: '#3b82f6' }} />
              </div>
              <div className={styles.statContent}>
                <p className={styles.statLabel}>Attendance %</p>
                <p className={styles.statValue}>{attendancePercentage}%</p>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className={`${styles.filtersSection} ${isDark ? styles.dark : ''}`}>
            <div className={styles.filterGroup}>
              <label htmlFor="date-filter" className={styles.filterLabel}>
                <MdCalendarToday /> Date
              </label>
              <input
                id="date-filter"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="subject-filter" className={styles.filterLabel}>
                <MdFilterList /> Subject
              </label>
              <select
                id="subject-filter"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={styles.filterSelect}
              >
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label htmlFor="search-filter" className={styles.filterLabel}>
                <MdSearch /> Search
              </label>
              <input
                id="search-filter"
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.filterInput}
              />
            </div>

            <button className={`${styles.btn} ${styles.btnSecondary}`}>
              <MdDownload /> Export
            </button>
          </div>

          {/* Attendance Table */}
          <div className={`${styles.tableSection} ${isDark ? styles.dark : ''}`}>
            <div className={styles.tableHeader}>
              <h2 className={styles.tableTitle}>
                Attendance Records ({filteredAttendance.length})
              </h2>
            </div>

            {filteredAttendance.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Subject</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Time</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record.id}>
                        <td className={styles.rollNumber}>{record.rollNumber}</td>
                        <td className={styles.studentName}>{record.studentName}</td>
                        <td className={styles.subject}>{record.subject}</td>
                        <td className={styles.date}>{record.date}</td>
                        <td>
                          <div className={styles.statusCell}>
                            {editingId === record.id ? (
                              <select
                                value={editingStatus}
                                onChange={(e) => {
                                  handleStatusChange(record.id, e.target.value);
                                  setEditingStatus('');
                                }}
                                className={styles.statusSelect}
                              >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                                <option value="Late">Late</option>
                              </select>
                            ) : (
                              <span
                                className={styles.statusBadge}
                                style={{ borderLeftColor: getStatusColor(record.status) }}
                              >
                                {getStatusIcon(record.status)}
                                {record.status}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={styles.time}>{record.time || '—'}</td>
                        <td className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => {
                              setEditingId(record.id);
                              setEditingStatus(record.status);
                            }}
                            title="Edit"
                          >
                            <MdEdit />
                          </button>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleDeleteRecord(record.id)}
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noData}>
                <MdCalendarToday size={48} />
                <p>No attendance records found for the selected filters.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
