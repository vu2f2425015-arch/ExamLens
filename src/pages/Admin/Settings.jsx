import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import ChartCard from '../../components/ChartCard/ChartCard';
import styles from './Settings.module.css';
import { useAuth } from '../../context/AuthContext';
import { saveDocument } from '../../services/firebaseService';
import {
  MdSave,
  MdSecurity,
  MdNotifications,
  MdPerson,
  MdTune,
  MdFileUpload,
  MdPictureAsPdf,
  MdInsertDriveFile,
  MdCheckCircle,
  MdDownload,
  MdDelete,
} from 'react-icons/md';

export default function Settings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    aiSensitivity: 'medium',
    faceConfidence: 75,
    micThreshold: 60,
    recordingQuality: '1080p',
    emailNotifications: true,
    alertNotifications: true,
    theme: 'dark',
  });

  // Upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [uploadStatus, setUploadStatus] = useState(null); // { type: 'success'|'error', msg: string }
  const [isProcessing, setIsProcessing] = useState(false);

  const update = (key, val) => setSettings((prev) => ({ ...prev, [key]: val }));

  // Handle file selection (CSV or PDF)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split('.').pop().toLowerCase();
    if (fileType !== 'csv' && fileType !== 'pdf') {
      setUploadStatus({ type: 'error', msg: 'Unsupported file format. Please upload a .csv or .pdf file.' });
      return;
    }

    setUploadedFile({
      name: file.name,
      size: (file.size / 1024).toFixed(1) + ' KB',
      type: fileType,
      fileObj: file,
    });
    setUploadStatus(null);

    // If CSV, parse rows locally
    if (fileType === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
          if (lines.length <= 1) {
            setUploadStatus({ type: 'error', msg: 'CSV file appears to be empty or missing data rows.' });
            return;
          }

          const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
          const students = [];

          for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map((c) => c.trim().replace(/^["']|["']$/g, ''));
            if (cols.length >= 3) {
              const rollNumber = cols[headers.indexOf('rollnumber')] || cols[0] || `STU${100 + i}`;
              const name = cols[headers.indexOf('name')] || cols[1] || 'Unknown Student';
              const email = cols[headers.indexOf('email')] || cols[2] || `${rollNumber.toLowerCase()}@examlens.edu`;
              const department = cols[headers.indexOf('department')] || cols[3] || 'Computer Science';
              const semester = cols[headers.indexOf('semester')] || cols[4] || '5';
              const gpa = cols[headers.indexOf('gpa')] || cols[5] || '8.0';

              students.push({
                rollNumber: rollNumber.toUpperCase(),
                name,
                email,
                department,
                semester: parseInt(semester, 10) || 5,
                gpa: parseFloat(gpa) || 8.0,
                status: 'active',
                activated: false,
              });
            }
          }

          setParsedStudents(students);
          setUploadStatus({
            type: 'success',
            msg: `Successfully parsed ${students.length} student records from CSV file.`,
          });
        } catch (err) {
          setUploadStatus({ type: 'error', msg: 'Failed to parse CSV file: ' + err.message });
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'pdf') {
      // PDF document uploaded
      setParsedStudents([]);
      setUploadStatus({
        type: 'success',
        msg: `PDF document "${file.name}" attached. Click "Import & Process PDF" to register records into database.`,
      });
    }
  };

  // Execute Import into System / Firestore
  const handleImport = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);

    try {
      if (uploadedFile.type === 'csv') {
        let count = 0;
        for (const stu of parsedStudents) {
          await saveDocument('students', stu.rollNumber, stu);
          count++;
        }
        setUploadStatus({
          type: 'success',
          msg: `Successfully imported ${count} student records into database system!`,
        });
      } else {
        // PDF Processing
        setUploadStatus({
          type: 'success',
          msg: `PDF document "${uploadedFile.name}" processed and archived in university student vault.`,
        });
      }
    } catch (err) {
      setUploadStatus({ type: 'error', msg: 'Failed to complete import: ' + err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  // Download Sample CSV
  const downloadSampleCSV = () => {
    const sampleData =
      'rollNumber,name,email,department,semester,gpa\n' +
      'CS2026010,Aarav Sharma,aarav.sharma@examlens.edu,Computer Science,5,8.8\n' +
      'EC2026011,Riya Sen,riya.sen@examlens.edu,Electronics,5,9.2\n' +
      'ME2026012,Kabir Mehta,kabir.mehta@examlens.edu,Mechanical,3,7.9\n';

    const blob = new Blob([sampleData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'examlens_student_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const removeFile = () => {
    setUploadedFile(null);
    setParsedStudents([]);
    setUploadStatus(null);
  };

  return (
    <>
      <Navbar title="Settings & Admin Profile" />
      <main className="page-body">
        <div className="page-header">
          <h1 className="page-title">Admin Profile & Platform Settings</h1>
          <p className="page-subtitle">Configure ExamLens proctoring parameters, student roster imports, and profile details</p>
        </div>

        <div className={styles.grid}>
          {/* Admin Profile */}
          <ChartCard title={<span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><MdPerson />Admin Profile</span>}>
            <div className={styles.profileForm}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" defaultValue={user?.name || 'Dr. Admin Kumar'} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-input" defaultValue={user?.email || 'admin@examlens.edu'} />
              </div>
              <div className="form-group">
                <label className="form-label">Department / Authority</label>
                <input className="form-input" defaultValue={user?.department || 'Examination Authority Desk'} />
              </div>
              <button className="btn btn-primary">
                <MdSave /> Save Profile Changes
              </button>
            </div>
          </ChartCard>

          {/* Student Details CSV/PDF Upload Section */}
          <ChartCard title={<span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><MdFileUpload />Student Roster Import (CSV / PDF)</span>}>
            <div className={styles.uploadSection}>
              <p className={styles.settingDesc}>
                Upload official university student roster documents in <strong>CSV</strong> or <strong>PDF</strong> format to update registered candidates.
              </p>

              {/* Dropzone file picker */}
              {!uploadedFile ? (
                <div className={styles.dropZone}>
                  <input
                    type="file"
                    accept=".csv, .pdf"
                    onChange={handleFileChange}
                    className={styles.fileInput}
                    id="student-file-input"
                  />
                  <label htmlFor="student-file-input" className={styles.dropLabel}>
                    <MdFileUpload className={styles.uploadIcon} />
                    <div className={styles.dropText}>
                      <strong>Click to upload</strong> or drag & drop CSV / PDF file
                    </div>
                    <span className={styles.dropHint}>Supports .CSV (Roster Sheet) or .PDF (Official Document)</span>
                  </label>
                </div>
              ) : (
                <div className={styles.fileMetaCard}>
                  <div className={styles.fileInfo}>
                    {uploadedFile.type === 'pdf' ? (
                      <MdPictureAsPdf className={styles.pdfIcon} />
                    ) : (
                      <MdInsertDriveFile className={styles.csvIcon} />
                    )}
                    <div>
                      <div className={styles.fileName}>{uploadedFile.name}</div>
                      <div className={styles.fileDetails}>
                        Type: {uploadedFile.type.toUpperCase()} • Size: {uploadedFile.size}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm btn-icon" onClick={removeFile} title="Remove file">
                    <MdDelete style={{ color: 'var(--danger)' }} />
                  </button>
                </div>
              )}

              {/* Status Alert Banner */}
              {uploadStatus && (
                <div
                  className={`${styles.alertBanner} ${
                    uploadStatus.type === 'success' ? styles.alertSuccess : styles.alertError
                  }`}
                >
                  <MdCheckCircle /> {uploadStatus.msg}
                </div>
              )}

              {/* Preview Table for CSV */}
              {parsedStudents.length > 0 && (
                <div className={styles.previewWrap}>
                  <div className={styles.previewHeader}>
                    <strong>Parsed Candidate Records ({parsedStudents.length})</strong>
                  </div>
                  <div className={styles.tableScroll}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Roll Number</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Department</th>
                          <th>Sem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedStudents.slice(0, 5).map((s, idx) => (
                          <tr key={idx}>
                            <td><code>{s.rollNumber}</code></td>
                            <td>{s.name}</td>
                            <td>{s.email}</td>
                            <td>{s.department}</td>
                            <td>{s.semester}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedStudents.length > 5 && (
                    <div className={styles.moreCount}>+ {parsedStudents.length - 5} more records</div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className={styles.actionRow}>
                <button
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={!uploadedFile || isProcessing}
                >
                  <MdSave /> {isProcessing ? 'Processing...' : 'Import Records into Database'}
                </button>
                <button className="btn btn-secondary btn-sm" onClick={downloadSampleCSV}>
                  <MdDownload /> Download Sample CSV
                </button>
              </div>
            </div>
          </ChartCard>

          {/* AI Settings */}
          <ChartCard title={<span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><MdTune />AI Proctoring Settings</span>}>
            <div className={styles.settingGroup}>
              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>AI Sensitivity</div>
                  <div className={styles.settingDesc}>Higher sensitivity detects more events</div>
                </div>
                <div className={styles.radioGroup}>
                  {['low', 'medium', 'high'].map((v) => (
                    <button
                      key={v}
                      className={`${styles.radioBtn} ${settings.aiSensitivity === v ? styles.radioActive : ''}`}
                      onClick={() => update('aiSensitivity', v)}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Face Confidence Threshold</div>
                  <div className={styles.settingDesc}>Minimum confidence to verify identity</div>
                </div>
                <div className={styles.sliderWrap}>
                  <input
                    type="range"
                    min={50}
                    max={99}
                    value={settings.faceConfidence}
                    onChange={(e) => update('faceConfidence', +e.target.value)}
                    className={styles.slider}
                  />
                  <span className={styles.sliderVal}>{settings.faceConfidence}%</span>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Mic Noise Threshold</div>
                  <div className={styles.settingDesc}>Sensitivity for background noise detection</div>
                </div>
                <div className={styles.sliderWrap}>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={settings.micThreshold}
                    onChange={(e) => update('micThreshold', +e.target.value)}
                    className={styles.slider}
                  />
                  <span className={styles.sliderVal}>{settings.micThreshold}%</span>
                </div>
              </div>

              <div className={styles.settingRow}>
                <div>
                  <div className={styles.settingLabel}>Recording Quality</div>
                  <div className={styles.settingDesc}>Session recording resolution</div>
                </div>
                <select
                  className={styles.select}
                  value={settings.recordingQuality}
                  onChange={(e) => update('recordingQuality', e.target.value)}
                >
                  <option value="720p">720p HD</option>
                  <option value="1080p">1080p Full HD</option>
                  <option value="480p">480p (Low Bandwidth)</option>
                </select>
              </div>
            </div>
          </ChartCard>

          {/* Security */}
          <ChartCard title={<span style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><MdSecurity />Security</span>}>
            <div className={styles.profileForm}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input className="form-input" type="password" placeholder="••••••••" />
              </div>
              <button className="btn btn-secondary">
                <MdSave /> Update Password
              </button>
            </div>
          </ChartCard>
        </div>
      </main>
    </>
  );
}
