import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { getTeachers, getDivisions, saveDocument } from '../../services/firebaseService';
import { teacherRoster } from '../../data/teachers';
import styles from './Teachers.module.css';
import {
  MdSearch,
  MdEdit,
  MdPersonAdd,
  MdFileUpload,
  MdClose,
  MdSave,
  MdDelete,
  MdBadge,
} from 'react-icons/md';

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTeacher, setActiveTeacher] = useState(null);
  const [statusNotice, setStatusNotice] = useState(null);

  const [formData, setFormData] = useState({
    employeeId: '',
    name: '',
    email: '',
    department: 'Computer Science',
    assignedDivisionIds: ['DIV001'],
    activated: false,
  });

  useEffect(() => {
    async function loadData() {
      const allTeachers = await getTeachers();
      setTeachers(allTeachers || []);
      const allDivs = await getDivisions();
      setDivisions(allDivs || []);
    }
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setActiveTeacher(null);
    setFormData({
      employeeId: `FAC2026${(teachers.length + 1).toString().padStart(3, '0')}`,
      name: '',
      email: '',
      department: 'Computer Science',
      assignedDivisionIds: ['DIV001'],
      activated: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tch) => {
    setActiveTeacher(tch);
    setFormData({
      employeeId: tch.employeeId || '',
      name: tch.name || '',
      email: tch.email || '',
      department: tch.department || 'Computer Science',
      assignedDivisionIds: tch.assignedDivisionIds || ['DIV001'],
      activated: tch.activated || false,
    });
    setIsModalOpen(true);
  };

  const handleToggleDivision = (divId) => {
    setFormData((prev) => {
      const current = prev.assignedDivisionIds || [];
      const updated = current.includes(divId)
        ? current.filter((d) => d !== divId)
        : [...current, divId];
      return { ...prev, assignedDivisionIds: updated };
    });
  };

  const handleSaveTeacher = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.employeeId) {
      alert('Please fill out Name and Employee ID.');
      return;
    }

    const cleanEmpId = formData.employeeId.trim().toUpperCase();
    const updatedRecord = {
      ...formData,
      id: activeTeacher?.id || `TCH_${cleanEmpId}`,
      employeeId: cleanEmpId,
      email: formData.email || `${cleanEmpId.toLowerCase()}@examlens.edu`,
    };

    // Save to memory roster
    teacherRoster[cleanEmpId] = updatedRecord;

    setTeachers((prev) => {
      const map = new Map();
      prev.forEach((t) => map.set(t.employeeId, t));
      map.set(cleanEmpId, updatedRecord);
      return Array.from(map.values());
    });

    await saveDocument('teachers', cleanEmpId, updatedRecord);

    setIsModalOpen(false);
    setStatusNotice({ type: 'success', msg: `Saved faculty member ${updatedRecord.name} (${cleanEmpId})!` });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleCSVImport = (e) => {
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
          const empId = parts[0].toUpperCase();
          const rec = {
            id: `TCH_${empId}`,
            employeeId: empId,
            name: parts[1],
            email: parts[2],
            department: parts[3] || 'Computer Science',
            assignedDivisionIds: parts[4] ? parts[4].split(';') : ['DIV001'],
            activated: false,
          };
          parsed.push(rec);
          teacherRoster[empId] = rec;
          await saveDocument('teachers', empId, rec);
        }
      }

      setTeachers((prev) => {
        const map = new Map();
        prev.forEach((t) => map.set(t.employeeId, t));
        parsed.forEach((t) => map.set(t.employeeId, t));
        return Array.from(map.values());
      });

      setStatusNotice({ type: 'success', msg: `Imported ${parsed.length} faculty records!` });
      setTimeout(() => setStatusNotice(null), 4000);
    };
    reader.readAsText(file);
  };

  const filtered = teachers.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.employeeId || '').toLowerCase().includes(query.toLowerCase()) ||
      (t.department || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Navbar title="Faculty & Teachers Roster" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Teachers Management Desk</h1>
            <p className="page-subtitle">Manage faculty roster, credentials, and division assignments</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
              <MdFileUpload /> Import Faculty CSV
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={handleCSVImport} />
            </label>

            <button className="btn btn-primary btn-sm" onClick={handleOpenAddModal}>
              <MdPersonAdd /> Add Faculty Member
            </button>
          </div>
        </div>

        {statusNotice && (
          <div className="alert alert-success" style={{ marginBottom: '1rem' }}>
            {statusNotice.msg}
          </div>
        )}

        <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
          <div className="input-wrapper">
            <MdSearch className="input-icon" />
            <input
              type="text"
              className="form-input"
              placeholder="Search faculty name, employee ID, or department..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Faculty Name</th>
                <th>Official Email</th>
                <th>Department</th>
                <th>Assigned Divisions</th>
                <th>Activation Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No faculty records found matching your query.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id || t.employeeId}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{t.employeeId}</td>
                    <td style={{ fontWeight: 600 }}>{t.name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{t.email}</td>
                    <td>{t.department}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {(t.assignedDivisionIds || []).map((did) => (
                          <span
                            key={did}
                            className="badge"
                            style={{ background: 'var(--stamp-slate-bg)', color: 'var(--primary-slate)' }}
                          >
                            {did}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${t.activated ? 'badge-success' : 'badge-warning'}`}>
                        {t.activated ? 'Activated' : 'Pending Activation'}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleOpenEditModal(t)}>
                        <MdEdit /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal for Add / Edit Teacher */}
        {isModalOpen && (
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{activeTeacher ? 'Edit Faculty Record' : 'Add New Faculty Member'}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                  <MdClose />
                </button>
              </div>
              <form onSubmit={handleSaveTeacher}>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label">Employee ID</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.employeeId}
                      onChange={(e) => setFormData((p) => ({ ...p, employeeId: e.target.value }))}
                      disabled={!!activeTeacher}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Faculty Full Name</label>
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
                    <label className="form-label">Department</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.department}
                      onChange={(e) => setFormData((p) => ({ ...p, department: e.target.value }))}
                    />
                  </div>

                  {/* Division Assignment Multi-Select */}
                  <div className="form-group">
                    <label className="form-label">Assign Divisions</label>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.35rem' }}>
                      {divisions.map((d) => (
                        <label
                          key={d.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            padding: '0.35rem 0.65rem',
                            border: '1px solid var(--border-rule)',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={(formData.assignedDivisionIds || []).includes(d.id)}
                            onChange={() => handleToggleDivision(d.id)}
                          />
                          {d.code}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave /> Save Faculty Member
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
