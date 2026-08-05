import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Students.module.css';
import students from '../../data/students.json';
import { getInitials } from '../../utils/formatters';
import { MdSearch, MdEdit, MdVisibility, MdPerson, MdFileUpload } from 'react-icons/md';

export default function Students() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = students.filter((s) => {
    const matchQ =
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(query.toLowerCase()) ||
      s.department.toLowerCase().includes(query.toLowerCase());
    const matchF = filter === 'all' || s.status === filter;
    return matchQ && matchF;
  });

  return (
    <>
      <Navbar title="Students" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Students</h1>
            <p className="page-subtitle">Manage and view all registered students</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Link to="/admin/settings" className="btn btn-secondary btn-sm">
              <MdFileUpload /> Import CSV / PDF
            </Link>
            <button className="btn btn-primary btn-sm">
              <MdPerson /> Add Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <MdSearch className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              placeholder="Search by name, roll no, department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={styles.filterGroup}>
            {['all', 'active', 'inactive'].map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statRow}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{students.length}</span>
            <span className={styles.statKey}>Total</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal} style={{ color: 'var(--accent)' }}>
              {students.filter((s) => s.status === 'active').length}
            </span>
            <span className={styles.statKey}>Active</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statVal} style={{ color: 'var(--danger)' }}>
              {students.filter((s) => s.status === 'inactive').length}
            </span>
            <span className={styles.statKey}>Inactive</span>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tableWrap}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>Semester</th>
                <th>GPA</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>{getInitials(s.name)}</div>
                      <div>
                        <div className={styles.studentName}>{s.name}</div>
                        <div className={styles.studentEmail}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className={styles.code}>{s.rollNumber}</code>
                  </td>
                  <td>{s.department}</td>
                  <td>Sem {s.semester}</td>
                  <td>
                    <span
                      style={{
                        color:
                          s.gpa >= 8.5
                            ? 'var(--accent)'
                            : s.gpa >= 7
                            ? 'var(--info)'
                            : 'var(--warning)',
                        fontWeight: 600,
                      }}
                    >
                      {s.gpa}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-accent' : 'badge-muted'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button className="btn btn-ghost btn-sm btn-icon" title="View">
                        <MdVisibility />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" title="Edit">
                        <MdEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className={styles.empty}>No students match your search.</div>}
        </div>
      </main>
    </>
  );
}
