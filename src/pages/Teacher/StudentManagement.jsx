import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getDivisions, getAllStudents, saveDocument } from '../../services/firebaseService';
import styles from './StudentManagement.module.css';
import {
  MdAdd, MdDelete, MdSearch, MdEdit, MdSave, MdClose, MdCheckCircle, MdCancel
} from 'react-icons/md';

export default function StudentManagement() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [divisions, setDivisions] = useState([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingStudent, setEditingStudent] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    rollNumber: '',
    phone: '',
  });

  // Load divisions and students
  useEffect(() => {
    async function loadData() {
      try {
        const assignedIds = user?.assignedDivisionIds || ['DIV001', 'DIV002'];
        
        const allDivs = await getDivisions();
        const filteredDivs = (allDivs || []).filter(d => assignedIds.includes(d.id));
        setDivisions(filteredDivs);
        
        if (filteredDivs.length > 0) {
          setSelectedDivision(filteredDivs[0].id);
        }

        const allStus = await getAllStudents();
        setStudents(allStus || []);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }
    loadData();
  }, [user]);

  // Filter students by division
  useEffect(() => {
    if (!selectedDivision) {
      setFilteredStudents([]);
      return;
    }

    let filtered = students.filter(s => s.divisionId === selectedDivision);

    if (search) {
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [selectedDivision, students, search]);

  const handleOpenAddModal = () => {
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      phone: '',
    });
    setEditingStudent(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student) => {
    setFormData({
      name: student.name,
      email: student.email,
      rollNumber: student.rollNumber,
      phone: student.phone || '',
    });
    setEditingStudent(student);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      rollNumber: '',
      phone: '',
    });
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.rollNumber) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (modalMode === 'add') {
        const newStudent = {
          id: `STU_${Date.now()}`,
          ...formData,
          divisionId: selectedDivision,
          createdAt: new Date().toISOString(),
          status: 'active',
          gpa: 8.0,
          attendancePercentage: 100,
        };

        const updated = [...students, newStudent];
        setStudents(updated);
        localStorage.setItem('students', JSON.stringify(updated));
        
        // Save to Firestore
        await saveDocument('students', newStudent.id, newStudent).catch(() => {});
      } else if (editingStudent) {
        const updated = students.map(s =>
          s.id === editingStudent.id
            ? { ...s, ...formData }
            : s
        );
        setStudents(updated);
        localStorage.setItem('students', JSON.stringify(updated));
        
        // Save to Firestore
        await saveDocument('students', editingStudent.id, { ...editingStudent, ...formData }).catch(() => {});
      }

      handleCloseModal();
    } catch (err) {
      console.error('Failed to save student:', err);
      alert('Failed to save student');
    }
  };

  const handleDeleteStudent = (id) => {
    if (window.confirm('Are you sure you want to remove this student from the division?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      localStorage.setItem('students', JSON.stringify(updated));
    }
  };

  const currentDivision = divisions.find(d => d.id === selectedDivision);
  const divisionStudentCount = filteredStudents.length;

  return (
    <>
      <Navbar title="Student Management" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Student Management</h1>
            <p className="page-subtitle">Add, edit, and remove students from your assigned divisions</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={handleOpenAddModal}
            disabled={!selectedDivision}
          >
            <MdAdd /> Add Student
          </button>
        </div>

        {/* Division Selector */}
        <div className={`${styles.divisionSelector} ${isDark ? styles.dark : ''}`}>
          <label className={styles.selectorLabel}>Select Division</label>
          <select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className={styles.selectorInput}
          >
            <option value="">-- Choose Division --</option>
            {divisions.map(div => (
              <option key={div.id} value={div.id}>
                {div.name} ({div.code}) - {div.department}
              </option>
            ))}
          </select>
        </div>

        {selectedDivision && currentDivision && (
          <>
            {/* Division Info */}
            <div className={`${styles.divisionInfo} ${isDark ? styles.dark : ''}`}>
              <div className={styles.infoCard}>
                <h3 className={styles.infoTitle}>{currentDivision.name}</h3>
                <p className={styles.infoDetail}>{currentDivision.code}</p>
                <p className={styles.infoDetail}>
                  {currentDivision.department} • Semester {currentDivision.semester}
                </p>
              </div>
              <div className={styles.infoCard}>
                <div className={styles.statValue}>{divisionStudentCount}</div>
                <div className={styles.statLabel}>Total Students</div>
              </div>
            </div>

            {/* Search Bar */}
            <div className={styles.searchBar}>
              <div className="input-wrapper">
                <MdSearch className="input-icon" />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name, roll number, or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Students Table */}
            <div className={`${styles.tableSection} ${isDark ? styles.dark : ''}`}>
              <div className={styles.tableHeader}>
                <h2 className={styles.tableTitle}>
                  Students ({filteredStudents.length})
                </h2>
              </div>

              {filteredStudents.length === 0 ? (
                <div className={styles.emptyState}>
                  <MdCancel size={48} />
                  <p>No students found in this division</p>
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={handleOpenAddModal}
                  >
                    <MdAdd /> Add First Student
                  </button>
                </div>
              ) : (
                <div className={styles.tableWrapper}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Roll Number</th>
                        <th>Student Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id}>
                          <td className={styles.rollNumber}>
                            <code>{student.rollNumber}</code>
                          </td>
                          <td className={styles.studentName}>{student.name}</td>
                          <td className={styles.email}>{student.email}</td>
                          <td className={styles.phone}>{student.phone || '—'}</td>
                          <td>
                            <span className={`${styles.badge} ${styles.active}`}>
                              <MdCheckCircle /> Active
                            </span>
                          </td>
                          <td className={styles.actions}>
                            <button
                              className={styles.actionBtn}
                              onClick={() => handleOpenEditModal(student)}
                              title="Edit"
                            >
                              <MdEdit />
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.danger}`}
                              onClick={() => handleDeleteStudent(student.id)}
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
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${isDark ? styles.dark : ''}`}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {modalMode === 'add' ? 'Add New Student' : 'Edit Student'}
                </h2>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={handleCloseModal}
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveStudent} className={styles.modalBody}>
                <div className="form-group">
                  <label className="form-label">Student Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Arjun Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Roll Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. CS2021001"
                    value={formData.rollNumber}
                    onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="e.g. arjun@university.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave /> {modalMode === 'add' ? 'Add' : 'Update'} Student
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
