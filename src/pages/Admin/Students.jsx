import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Students.module.css';
import {
  getAllStudents,
  getInitialStudentsSync,
  saveLocalStorageStudents,
  saveDocument,
  checkFirebaseConnection,
  seedFirestoreData,
} from '../../services/firebaseService';
import { isFirebaseConfigured } from '../../config/firebase';
import { getInitials } from '../../utils/formatters';
import {
  MdSearch,
  MdEdit,
  MdVisibility,
  MdPersonAdd,
  MdFileUpload,
  MdRefresh,
  MdClose,
  MdSave,
  MdDelete,
  MdCheckCircle,
  MdCloudDone,
  MdCloudUpload,
} from 'react-icons/md';

export default function Students() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  // ⚡ 0ms INSTANT RENDER: Initialize with local cache + roster (108 records up front!)
  const [students, setStudents] = useState(() => getInitialStudentsSync());
  const [isSyncing, setIsSyncing] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(null);

  // Background silent revalidation & Firebase status check
  const refreshStudents = async (showLoadingState = false) => {
    if (showLoadingState) setIsSyncing(true);
    try {
      const data = await getAllStudents();
      if (data && data.length > 0) {
        setStudents(data);
      }
    } catch (e) {
      console.error('Failed to load background students:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshStudents(false);

    // Verify Firebase connection status
    checkFirebaseConnection().then((res) => {
      setFirebaseStatus(res);
    });
  }, []);

  // Trigger manual cloud sync to Firebase
  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    setStatusNotice({ type: 'info', msg: 'Syncing all candidate records to Cloud Firestore...' });

    try {
      const res = await seedFirestoreData();
      if (res.success) {
        setStatusNotice({
          type: 'success',
          msg: `Successfully synced ${res.count || students.length} records to Cloud Firestore (project: examlens-84e91)!`,
        });
        checkFirebaseConnection().then((res) => setFirebaseStatus(res));
      } else {
        setStatusNotice({ type: 'error', msg: 'Cloud sync note: Saved locally. (Check Firebase rules for cloud sync)' });
      }
    } catch (err) {
      setStatusNotice({ type: 'error', msg: 'Sync completed locally: ' + err.message });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeStudent, setActiveStudent] = useState(null);
  const [isEditingExisting, setIsEditingExisting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    rollNumber: '',
    name: '',
    email: '',
    department: 'Computer Science',
    semester: 5,
    gpa: 8.0,
    status: 'active',
    activated: false,
  });

  // Open Modal to Add Student
  const handleOpenAddModal = () => {
    setIsEditingExisting(false);
    setFormData({
      rollNumber: `STU${Date.now().toString().slice(-4)}`,
      name: '',
      email: '',
      department: 'Computer Science',
      semester: 5,
      gpa: 8.5,
      status: 'active',
      activated: false,
    });
    setIsEditModalOpen(true);
  };

  // Open Modal to Edit Student
  const handleOpenEditModal = (stu) => {
    setIsEditingExisting(true);
    setActiveStudent(stu);
    setFormData({
      rollNumber: stu.rollNumber || '',
      name: stu.name || '',
      email: stu.email || '',
      department: stu.department || 'Computer Science',
      semester: stu.semester || 5,
      gpa: stu.gpa || 8.0,
      status: stu.status || 'active',
      activated: stu.activated || false,
    });
    setIsEditModalOpen(true);
  };

  // Open View Modal
  const handleOpenViewModal = (stu) => {
    setActiveStudent(stu);
    setIsViewModalOpen(true);
  };

  // Save Form (Add or Edit)
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber) {
      alert('Please fill out Name and Roll Number.');
      return;
    }

    const cleanRoll = formData.rollNumber.trim().toUpperCase();
    const updatedRecord = {
      ...formData,
      id: activeStudent?.id || `STU_${cleanRoll}`,
      rollNumber: cleanRoll,
      email: formData.email || `${cleanRoll.toLowerCase()}@examlens.edu`,
      semester: parseInt(formData.semester, 10) || 5,
      gpa: parseFloat(formData.gpa) || 8.0,
    };

    // 1. Instantly save to LocalStorage & update memory state
    saveLocalStorageStudents([updatedRecord]);

    setStudents((prev) => {
      const map = new Map();
      prev.forEach((s) => map.set(s.rollNumber, s));
      map.set(cleanRoll, updatedRecord);
      return Array.from(map.values());
    });

    // 2. Sync to Cloud Firestore if Firebase is active
    let cloudSynced = false;
    if (isFirebaseConfigured()) {
      cloudSynced = await saveDocument('students', cleanRoll, updatedRecord);
    }

    setIsEditModalOpen(false);
    setStatusNotice({
      type: 'success',
      msg: isEditingExisting
        ? `Updated candidate ${updatedRecord.name} (${cleanRoll})! ${cloudSynced ? '[Synced to Firebase]' : '[Saved to Database]'}`
        : `Added candidate ${updatedRecord.name} (${cleanRoll})! ${cloudSynced ? '[Synced to Firebase]' : '[Saved to Database]'}`,
    });

    setTimeout(() => setStatusNotice(null), 4000);
  };

  // Delete / Remove Student
  const handleDeleteStudent = (rollNumber) => {
    if (!window.confirm(`Are you sure you want to remove candidate ${rollNumber}?`)) return;

    setStudents((prev) => prev.filter((s) => s.rollNumber !== rollNumber));

    try {
      const custom = JSON.parse(localStorage.getItem('examlens_custom_students') || '[]');
      const filteredCustom = custom.filter((s) => s.rollNumber !== rollNumber);
      localStorage.setItem('examlens_custom_students', JSON.stringify(filteredCustom));
    } catch (e) {
      console.error(e);
    }

    setIsEditModalOpen(false);
    setStatusNotice({
      type: 'success',
      msg: `Candidate record ${rollNumber} removed from database.`,
    });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const filtered = students.filter((s) => {
    const matchQ =
      (s.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (s.rollNumber || '').toLowerCase().includes(query.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(query.toLowerCase());
    const matchF = filter === 'all' || s.status === filter;
    return matchQ && matchF;
  });

  return (
    <>
      <Navbar title="Students" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Students Roster</h1>
            <p className="page-subtitle">Add, edit, and manage registered student records</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Firebase Cloud Status Indicator */}
            {isFirebaseConfigured() ? (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '4px',
                  background: '#f0fdf4',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                }}
                title="Connected to Firebase project: examlens-84e91"
              >
                <MdCloudDone style={{ fontSize: '1rem', color: '#16a34a' }} /> Firebase Connected ({firebaseStatus?.count ? `${firebaseStatus.count} Cloud Docs` : 'examlens-84e91'})
              </span>
            ) : (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '4px',
                  background: '#fefce8',
                  color: '#854d0e',
                  border: '1px solid #fef08a',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600,
                }}
              >
                Local Storage Vault Active
              </span>
            )}

            <button className="btn btn-secondary btn-sm" onClick={handleSyncToFirebase} title="Sync all 108 records to Cloud Firestore">
              <MdCloudUpload /> Sync to Firebase
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => refreshStudents(true)} title="Refresh list">
              <MdRefresh /> {isSyncing ? 'Syncing...' : 'Refresh'}
            </button>
            <Link to="/admin/settings" className="btn btn-secondary btn-sm">
              <MdFileUpload /> Import CSV / PDF
            </Link>
            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
              <MdPersonAdd /> Add Student
            </button>
          </div>
        </div>

        {/* Status Notice Alert */}
        {statusNotice && (
          <div
            style={{
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              borderRadius: '6px',
              background: statusNotice.type === 'error' ? '#fef2f2' : '#f0fdf4',
              border: statusNotice.type === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0',
              color: statusNotice.type === 'error' ? '#991b1b' : '#15803d',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontWeight: 500,
            }}
          >
            <MdCheckCircle style={{ fontSize: '1.2rem' }} /> {statusNotice.msg}
          </div>
        )}

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
              {filtered.map((s, idx) => (
                <tr key={s.id || s.rollNumber || idx}>
                  <td>
                    <div className={styles.studentCell}>
                      <div className={styles.avatar}>{getInitials(s.name || 'ST')}</div>
                      <div>
                        <div className={styles.studentName}>{s.name}</div>
                        <div className={styles.studentEmail}>{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className={styles.code}>{s.rollNumber}</code>
                  </td>
                  <td>{s.department || 'N/A'}</td>
                  <td>Sem {s.semester || '5'}</td>
                  <td>
                    <span
                      style={{
                        color:
                          (s.gpa || 0) >= 8.5
                            ? 'var(--accent)'
                            : (s.gpa || 0) >= 7
                            ? 'var(--info)'
                            : 'var(--warning)',
                        fontWeight: 600,
                      }}
                    >
                      {s.gpa || '8.0'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${s.status === 'active' ? 'badge-accent' : 'badge-muted'}`}>
                      {s.status || 'active'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        title="View Details"
                        onClick={() => handleOpenViewModal(s)}
                      >
                        <MdVisibility />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-icon"
                        title="Edit / Change Data"
                        onClick={() => handleOpenEditModal(s)}
                      >
                        <MdEdit />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className={styles.empty}>No students match your search.</div>
          )}
        </div>

        {/* Add / Edit Student Modal */}
        {isEditModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>
                  {isEditingExisting ? `Edit Candidate Record (${formData.rollNumber})` : 'Add New Candidate Record'}
                </div>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  <MdClose />
                </button>
              </div>

              <form onSubmit={handleSaveStudent}>
                <div className={styles.modalBody}>
                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Roll Number</label>
                      <input
                        className={styles.formInput}
                        value={formData.rollNumber}
                        onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                        disabled={isEditingExisting}
                        placeholder="e.g. CS2026001"
                        required
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Full Name</label>
                      <input
                        className={styles.formInput}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Ananya Sharma"
                        required
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Email Address</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. student@examlens.edu"
                      required
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Department</label>
                      <select
                        className={styles.formInput}
                        value={formData.department}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      >
                        <option value="Computer Science">Computer Science</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Mechanical">Mechanical</option>
                        <option value="Civil">Civil</option>
                        <option value="Information Technology">Information Technology</option>
                        <option value="Electrical">Electrical</option>
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Semester</label>
                      <select
                        className={styles.formInput}
                        value={formData.semester}
                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <option key={sem} value={sem}>
                            Semester {sem}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>GPA Score</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="10"
                        className={styles.formInput}
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>Account Status</label>
                      <select
                        className={styles.formInput}
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className={styles.modalFooter}>
                  <div>
                    {isEditingExisting && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => handleDeleteStudent(formData.rollNumber)}
                      >
                        <MdDelete /> Delete Record
                      </button>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary btn-sm">
                      <MdSave /> {isEditingExisting ? 'Save Changes' : 'Add Candidate'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {isViewModalOpen && activeStudent && (
          <div className={styles.modalOverlay} onClick={() => setIsViewModalOpen(false)}>
            <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <div className={styles.modalTitle}>Candidate Transcript Details</div>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  <MdClose />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.viewDetailsList}>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Full Name</span>
                    <span className={styles.viewDetailVal}>{activeStudent.name}</span>
                  </div>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Roll Number</span>
                    <code className={styles.code}>{activeStudent.rollNumber}</code>
                  </div>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Official Email</span>
                    <span className={styles.viewDetailVal}>{activeStudent.email}</span>
                  </div>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Department</span>
                    <span className={styles.viewDetailVal}>{activeStudent.department}</span>
                  </div>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Semester</span>
                    <span className={styles.viewDetailVal}>Semester {activeStudent.semester}</span>
                  </div>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Academic GPA</span>
                    <span className={styles.viewDetailVal}>{activeStudent.gpa} / 10.0</span>
                  </div>
                  <div className={styles.viewDetailRow}>
                    <span className={styles.viewDetailKey}>Portal Activation Status</span>
                    <span className={`badge ${activeStudent.activated ? 'badge-accent' : 'badge-muted'}`}>
                      {activeStudent.activated ? 'Activated' : 'Pending Activation'}
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.modalFooter} style={{ justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEditModal(activeStudent);
                  }}
                >
                  <MdEdit /> Edit Student Data
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
