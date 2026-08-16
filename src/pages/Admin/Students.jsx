import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import styles from './Students.module.css';
import {
  getAllStudents,
  getInitialStudentsSync,
  saveLocalStorageStudents,
  saveDocument,
  checkFirebaseConnection,
  seedFirestoreData,
  clearAllStudents,
  getDivisions,
} from '../../services/firebaseService';
import { isFirebaseConfigured } from '../../config/firebase';
import { getInitials, formatGPA } from '../../utils/formatters';
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
  MdClass,
  MdFilterList,
} from 'react-icons/md';

export default function Students() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedDivisionFilter, setSelectedDivisionFilter] = useState('all');

  const [students, setStudents] = useState(() => getInitialStudentsSync());
  const [divisions, setDivisions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState(null);

  const refreshStudents = async (showLoadingState = false) => {
    if (showLoadingState) setIsSyncing(true);
    try {
      const data = await getAllStudents();
      setStudents(data || []);
      const divs = await getDivisions();
      setDivisions(divs || []);
    } catch (e) {
      console.error('Failed to load background data:', e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshStudents(false);
    checkFirebaseConnection().then((res) => {
      setFirebaseStatus(res);
    });
  }, []);

  const handleSyncToFirebase = async () => {
    setIsSyncing(true);
    setStatusNotice({ type: 'info', msg: 'Syncing all candidate records to Cloud Firestore...' });

    try {
      const res = await seedFirestoreData();
      if (res.success) {
        setStatusNotice({
          type: 'success',
          msg: `Successfully synced ${res.count || students.length} records to Cloud Firestore!`,
        });
        checkFirebaseConnection().then((res) => setFirebaseStatus(res));
      } else {
        setStatusNotice({ type: 'error', msg: 'Cloud sync note: Saved locally.' });
      }
    } catch (err) {
      setStatusNotice({ type: 'error', msg: 'Sync completed locally: ' + err.message });
    } finally {
      setIsSyncing(false);
      setTimeout(() => setStatusNotice(null), 5000);
    }
  };

  const handleDeleteAllStudents = async () => {
    if (
      !window.confirm(
        'WARNING: Are you sure you want to delete ALL candidate records from local storage and Cloud Firestore?'
      )
    ) {
      return;
    }

    setIsSyncing(true);
    setStatusNotice({ type: 'info', msg: 'Deleting all student records...' });

    try {
      await clearAllStudents();
      setStudents([]);
      setStatusNotice({
        type: 'success',
        msg: 'All student records deleted successfully!',
      });
      checkFirebaseConnection().then((res) => setFirebaseStatus(res));
    } catch (err) {
      setStatusNotice({ type: 'error', msg: 'Failed to clear records: ' + err.message });
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
    semester: 4,
    divisionId: 'DIV001',
    gpa: 3.8,
    status: 'Verified',
    activated: false,
  });

  const handleOpenAddModal = () => {
    setIsEditingExisting(false);
    setFormData({
      rollNumber: `CS${Date.now().toString().slice(-4)}`,
      name: '',
      email: '',
      department: 'Computer Science',
      semester: 4,
      divisionId: 'DIV001',
      gpa: 3.8,
      status: 'Verified',
      activated: false,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (stu) => {
    setIsEditingExisting(true);
    setActiveStudent(stu);
    setFormData({
      rollNumber: stu.rollNumber || '',
      name: stu.name || '',
      email: stu.email || '',
      department: stu.department || 'Computer Science',
      semester: stu.semester || 4,
      divisionId: stu.divisionId || 'DIV001',
      gpa: stu.gpa || 3.8,
      status: stu.status || 'Verified',
      activated: stu.activated || false,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenViewModal = (stu) => {
    setActiveStudent(stu);
    setIsViewModalOpen(true);
  };

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
      semester: parseInt(formData.semester, 10) || 4,
      gpa: parseFloat(formData.gpa) || 3.5,
    };

    saveLocalStorageStudents([updatedRecord]);

    setStudents((prev) => {
      const map = new Map();
      prev.forEach((s) => map.set(s.rollNumber, s));
      map.set(cleanRoll, updatedRecord);
      return Array.from(map.values());
    });

    if (isFirebaseConfigured()) {
      await saveDocument('students', cleanRoll, updatedRecord);
    }

    setIsEditModalOpen(false);
    setStatusNotice({
      type: 'success',
      msg: isEditingExisting
        ? `Updated candidate ${updatedRecord.name} (${cleanRoll})!`
        : `Added candidate ${updatedRecord.name} (${cleanRoll})!`,
    });

    setTimeout(() => setStatusNotice(null), 4000);
  };

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

  // Generalized CSV Import
  const handleCSVImport = (e, type = 'student') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') return;

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length <= 1) return;

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
        if (parts.length >= 3) {
          parsed.push({
            id: `STU_${parts[0]}`,
            rollNumber: parts[0],
            name: parts[1],
            email: parts[2],
            department: parts[3] || 'Computer Science',
            semester: parseInt(parts[4] || '4', 10),
            divisionId: parts[5] || 'DIV001',
            gpa: parseFloat(parts[6] || '3.5'),
            status: 'Verified',
            activated: false,
          });
        }
      }

      saveLocalStorageStudents(parsed);
      setStudents((prev) => {
        const map = new Map();
        prev.forEach((s) => map.set(s.rollNumber, s));
        parsed.forEach((s) => map.set(s.rollNumber, s));
        return Array.from(map.values());
      });

      setStatusNotice({
        type: 'success',
        msg: `Successfully imported ${parsed.length} candidate records from CSV!`,
      });
      setTimeout(() => setStatusNotice(null), 4000);
    };
    reader.readAsText(file);
  };

  const getDivisionMetrics = (divId) => {
    const divStus = students.filter((s) => s.divisionId === divId);
    const count = divStus.length;
    const avgGpa =
      count > 0 ? (divStus.reduce((acc, curr) => acc + (curr.gpa || 3.5), 0) / count).toFixed(2) : '0.00';
    return { count, avgGpa };
  };

  const filtered = students.filter((s) => {
    const matchQ =
      (s.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (s.rollNumber || '').toLowerCase().includes(query.toLowerCase()) ||
      (s.department || '').toLowerCase().includes(query.toLowerCase());
    const matchF = filter === 'all' || s.status === filter;
    const matchDiv = selectedDivisionFilter === 'all' || s.divisionId === selectedDivisionFilter;
    return matchQ && matchF && matchDiv;
  });

  return (
    <>
      <Navbar title="Students Roster" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Candidate Roster & Division Grid</h1>
            <p className="page-subtitle">Manage student enrollment, division cohorts, and accounts</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
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
              >
                <MdCloudDone style={{ fontSize: '1rem', color: '#16a34a' }} /> Firebase Connected
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
                }}
              >
                Local Storage Active
              </span>
            )}

            <button className="btn btn-secondary btn-sm" onClick={handleSyncToFirebase}>
              <MdCloudUpload /> Sync to Firebase
            </button>

            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              <MdFileUpload /> Import CSV
              <input
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={(e) => handleCSVImport(e, 'student')}
              />
            </label>

            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
              <MdPersonAdd /> Add Student
            </button>

            <button className="btn btn-secondary btn-sm" onClick={handleDeleteAllStudents} title="Clear all students">
              <MdDelete /> Clear All
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className={`alert alert-${statusNotice.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem' }}>
            {statusNotice.msg}
          </div>
        )}

        {/* Division Grid Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
              Division Cohort Grid
            </h3>
            {selectedDivisionFilter !== 'all' && (
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDivisionFilter('all')}>
                Show All Divisions
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            <div
              onClick={() => setSelectedDivisionFilter('all')}
              style={{
                background: selectedDivisionFilter === 'all' ? 'var(--stamp-slate-bg)' : 'var(--surface-card)',
                border: `1px solid ${selectedDivisionFilter === 'all' ? 'var(--primary-slate)' : 'var(--border-rule)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-slate)', fontFamily: 'var(--font-mono)' }}>
                ALL COHORTS
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0.25rem 0' }}>All Students</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{students.length} Total Enrolled</div>
            </div>

            {divisions.map((div) => {
              const { count, avgGpa } = getDivisionMetrics(div.id);
              const isSelected = selectedDivisionFilter === div.id;
              return (
                <div
                  key={div.id}
                  onClick={() => setSelectedDivisionFilter(div.id)}
                  style={{
                    background: isSelected ? 'var(--stamp-slate-bg)' : 'var(--surface-card)',
                    border: `1px solid ${isSelected ? 'var(--primary-slate)' : 'var(--border-rule)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--primary-slate)' }}>
                      {div.code}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Sem {div.semester}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', margin: '0.25rem 0' }}>{div.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span>{count} Students</span>
                    <span>Avg GPA: {avgGpa}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <div className="input-wrapper" style={{ flex: 1, minWidth: '240px' }}>
            <MdSearch className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search candidate name, roll number, or department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '130px', minWidth: '130px' }}>Roll Number</th>
                <th style={{ minWidth: '180px' }}>Candidate Name</th>
                <th style={{ width: '110px', minWidth: '110px' }}>Division</th>
                <th style={{ minWidth: '210px' }}>Department</th>
                <th style={{ width: '110px', minWidth: '110px' }}>Semester</th>
                <th style={{ width: '90px', minWidth: '90px' }}>GPA</th>
                <th style={{ width: '130px', minWidth: '130px' }}>Activation</th>
                <th style={{ width: '100px', minWidth: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2.5rem' }}>
                    No candidates found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id || s.rollNumber}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-ink)' }}>
                      {s.rollNumber}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-ink)' }}>{s.name}</td>
                    <td>
                      <span className="badge badge-primary">
                        {s.divisionId || 'DIV001'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-body)' }}>{s.department}</td>
                    <td style={{ color: 'var(--text-body)' }}>Sem {s.semester}</td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-ink)' }}>
                      {formatGPA(s.gpa)}
                    </td>
                    <td>
                      <span className={`badge ${s.activated ? 'badge-success' : 'badge-warning'}`}>
                        {s.activated ? 'ACTIVATED' : 'PENDING'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => handleOpenViewModal(s)}
                          title="View Candidate Profile"
                        >
                          <MdVisibility size={17} />
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-icon"
                          onClick={() => handleOpenEditModal(s)}
                          title="Edit Candidate Details"
                        >
                          <MdEdit size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Edit / Add Modal */}
        {isEditModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsEditModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{isEditingExisting ? 'Edit Candidate Record' : 'Add New Candidate'}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsEditModalOpen(false)}>
                  <MdClose />
                </button>
              </div>
              <form onSubmit={handleSaveStudent}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Roll Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData((p) => ({ ...p, rollNumber: e.target.value }))}
                      disabled={isEditingExisting}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Official Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Assigned Division</label>
                    <select
                      className="form-input"
                      value={formData.divisionId}
                      onChange={(e) => setFormData((p) => ({ ...p, divisionId: e.target.value }))}
                    >
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.code} - {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  {isEditingExisting && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ color: 'var(--stamp-red)' }}
                      onClick={() => handleDeleteStudent(formData.rollNumber)}
                    >
                      <MdDelete /> Delete
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave /> Save Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Modal */}
        {isViewModalOpen && activeStudent && (
          <div className="modal-backdrop" onClick={() => setIsViewModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Candidate Profile Detail</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsViewModalOpen(false)}>
                  <MdClose />
                </button>
              </div>
              <div className="modal-body">
                <p><strong>Name:</strong> {activeStudent.name}</p>
                <p><strong>Roll Number:</strong> {activeStudent.rollNumber}</p>
                <p><strong>Email:</strong> {activeStudent.email}</p>
                <p><strong>Division:</strong> {activeStudent.divisionId || 'DIV001'}</p>
                <p><strong>Department:</strong> {activeStudent.department}</p>
                <p><strong>Semester:</strong> {activeStudent.semester}</p>
                <p><strong>GPA:</strong> {activeStudent.gpa || 3.5}</p>
                <p><strong>Activation Status:</strong> {activeStudent.activated ? 'Activated' : 'Pending Activation'}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
