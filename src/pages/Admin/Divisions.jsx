import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { getDivisions, getAllStudents, saveDocument } from '../../services/firebaseService';
import { divisionRoster } from '../../data/divisions';
import styles from './Divisions.module.css';
import { MdAdd, MdEdit, MdDelete, MdClose, MdSave, MdPeople, MdSearch } from 'react-icons/md';

export default function Divisions() {
  const [divisions, setDivisions] = useState([]);
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeDivision, setActiveDivision] = useState(null);
  const [statusNotice, setStatusNotice] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    code: '',
    department: 'Computer Science',
    semester: 4,
    name: '',
  });

  useEffect(() => {
    async function loadData() {
      const allDivs = await getDivisions();
      setDivisions(allDivs || []);
      const allStus = await getAllStudents();
      setStudents(allStus || []);
    }
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setActiveDivision(null);
    const nextId = `DIV${(divisions.length + 1).toString().padStart(3, '0')}`;
    setFormData({
      id: nextId,
      code: `CS2026-${String.fromCharCode(65 + divisions.length)}`,
      department: 'Computer Science',
      semester: 4,
      name: `CS Sem 4 - Division ${String.fromCharCode(65 + divisions.length)}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (div) => {
    setActiveDivision(div);
    setFormData({
      id: div.id,
      code: div.code,
      department: div.department,
      semester: div.semester,
      name: div.name,
    });
    setIsModalOpen(true);
  };

  const handleSaveDivision = async (e) => {
    e.preventDefault();
    if (!formData.code || !formData.name) {
      alert('Please fill out Division Code and Name.');
      return;
    }

    const updated = {
      ...formData,
      semester: parseInt(formData.semester, 10) || 4,
    };

    divisionRoster[updated.id] = updated;

    setDivisions((prev) => {
      const map = new Map();
      prev.forEach((d) => map.set(d.id, d));
      map.set(updated.id, updated);
      return Array.from(map.values());
    });

    await saveDocument('divisions', updated.id, updated);

    setIsModalOpen(false);
    setStatusNotice({ type: 'success', msg: `Saved division ${updated.code} (${updated.name})!` });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleDeleteDivision = (divId) => {
    if (!window.confirm(`Are you sure you want to delete division ${divId}?`)) return;
    delete divisionRoster[divId];
    setDivisions((prev) => prev.filter((d) => d.id !== divId));
    setIsModalOpen(false);
  };

  const filteredDivisions = divisions.filter(
    (d) =>
      (d.code || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (d.department || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar title="Divisions Management" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Divisions & Cohorts Desk</h1>
            <p className="page-subtitle">Create, configure, and manage student division cohorts</p>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
            <MdAdd /> Create Division
          </button>
        </div>

        {statusNotice && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {statusNotice.msg}
          </div>
        )}

        {/* Search Bar */}
        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
          <div className="input-wrapper">
            <MdSearch className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search division code, name, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.grid}>
          {filteredDivisions.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              No division cohorts found matching your search.
            </div>
          ) : (
            filteredDivisions.map((div) => {
              const count = students.filter((s) => s.divisionId === div.id).length;
              return (
                <div key={div.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <span className={styles.codeBadge}>{div.code}</span>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(div)}>
                      <MdEdit /> Edit
                    </button>
                  </div>

                  <h3 className={styles.title}>{div.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                    {div.department} • Semester {div.semester}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                    <MdPeople style={{ color: 'var(--primary-slate)' }} /> {count} Enrolled Candidates
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Create / Edit Modal */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{activeDivision ? 'Edit Division' : 'Create Division'}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                  <MdClose />
                </button>
              </div>
              <form onSubmit={handleSaveDivision}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Division ID</label>
                    <input type="text" className="form-input" value={formData.id} disabled />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Division Code</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.code}
                      onChange={(e) => setFormData((p) => ({ ...p, code: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Division Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <input
                      type="number"
                      className="form-input"
                      value={formData.semester}
                      onChange={(e) => setFormData((p) => ({ ...p, semester: parseInt(e.target.value, 10) }))}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  {activeDivision && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      style={{ color: 'var(--stamp-red)' }}
                      onClick={() => handleDeleteDivision(formData.id)}
                    >
                      <MdDelete /> Delete
                    </button>
                  )}
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave /> Save Division
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
