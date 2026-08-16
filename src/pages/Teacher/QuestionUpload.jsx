import { useState } from 'react';
import Navbar from '../../components/Navbar/Navbar';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import styles from './QuestionUpload.module.css';
import {
  MdCloudUpload, MdCheckCircle, MdError, MdDownload, MdDelete, MdVisibility
} from 'react-icons/md';

export default function QuestionUpload() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Template download
  const handleDownloadTemplate = () => {
    const template = `examId,questionNumber,question,optionA,optionB,optionC,optionD,correctAnswer,marks
EXAM_001,1,"What is the time complexity of binary search?","O(N)","O(log N)","O(N log N)","O(1)","B",5
EXAM_001,2,"Which data structure uses LIFO principle?","Queue","Stack","Array","Linked List","B",5`;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(template));
    element.setAttribute('download', 'questions_template.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (file) => {
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.json')) {
      setUploadStatus({
        type: 'error',
        message: 'Please upload a CSV or JSON file'
      });
      return;
    }

    setSelectedFile(file);
    setUploadStatus({
      type: 'processing',
      message: 'Processing file...'
    });

    try {
      const text = await file.text();
      let parsedData;

      if (file.name.endsWith('.csv')) {
        parsedData = parseCSV(text);
      } else {
        parsedData = JSON.parse(text);
      }

      // Validate data
      const validation = validateQuestions(parsedData);
      if (!validation.valid) {
        setUploadStatus({
          type: 'error',
          message: `Validation error: ${validation.message}`
        });
        return;
      }

      // Show preview
      setPreviewData(parsedData);
      setPreviewMode(true);

      setUploadStatus({
        type: 'success',
        message: `File ready! Contains ${parsedData.length} questions. Review and confirm upload.`
      });
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: `Failed to parse file: ${err.message}`
      });
    }
  };

  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const obj = {};

      headers.forEach((header, idx) => {
        obj[header] = values[idx];
      });

      data.push(obj);
    }

    return data;
  };

  const validateQuestions = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: 'No questions found in file' };
    }

    for (let i = 0; i < data.length; i++) {
      const q = data[i];
      if (!q.examId || !q.question || !q.optionA || !q.optionB || !q.optionC || !q.optionD || !q.correctAnswer) {
        return { 
          valid: false, 
          message: `Question ${i + 1} is missing required fields` 
        };
      }
    }

    return { valid: true };
  };

  const confirmUpload = async () => {
    if (!previewData) return;

    setUploadStatus({
      type: 'processing',
      message: 'Uploading questions to database...'
    });

    try {
      // Transform data to match the application schema
      const transformedQuestions = previewData.map((q, idx) => ({
        id: `Q_${Date.now()}_${idx}`,
        examId: q.examId,
        question: q.question,
        options: [q.optionA, q.optionB, q.optionC, q.optionD],
        correctOption: getCorrectOptionIndex(q.correctAnswer),
        marks: parseInt(q.marks || 5, 10),
        uploadedBy: user?.name || 'Faculty',
        uploadedAt: new Date().toISOString()
      }));

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('teacherQuestions') || '[]');
      const all = [...existing, ...transformedQuestions];
      localStorage.setItem('teacherQuestions', JSON.stringify(all));

      // Add to uploaded files list
      setUploadedFiles([
        {
          id: Date.now(),
          name: selectedFile.name,
          size: selectedFile.size,
          uploadedAt: new Date().toLocaleString(),
          questionCount: transformedQuestions.length,
          status: 'success'
        },
        ...uploadedFiles
      ]);

      setUploadStatus({
        type: 'success',
        message: `Successfully uploaded ${transformedQuestions.length} questions!`
      });

      // Reset
      setTimeout(() => {
        setPreviewMode(false);
        setPreviewData(null);
        setSelectedFile(null);
        setUploadStatus(null);
      }, 2000);
    } catch (err) {
      setUploadStatus({
        type: 'error',
        message: `Upload failed: ${err.message}`
      });
    }
  };

  const getCorrectOptionIndex = (answer) => {
    const map = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
    return map[answer.toUpperCase()] || 0;
  };

  return (
    <>
      <Navbar title="Question Paper Upload" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Question Paper Upload</h1>
            <p className="page-subtitle">Bulk upload exam questions from CSV or JSON files</p>
          </div>
        </div>

        {/* Status Message */}
        {uploadStatus && (
          <div className={`alert alert-${uploadStatus.type} ${styles.statusAlert}`}>
            <div className={styles.statusContent}>
              {uploadStatus.type === 'success' && <MdCheckCircle />}
              {uploadStatus.type === 'error' && <MdError />}
              {uploadStatus.type === 'processing' && <div className={styles.spinner} />}
              <span>{uploadStatus.message}</span>
            </div>
          </div>
        )}

        <div className={styles.container}>
          {/* Upload Section */}
          {!previewMode ? (
            <>
              {/* Template Download */}
              <div className={`${styles.card} ${isDark ? styles.dark : ''}`}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.cardTitle}>Get Started</h2>
                </div>
                <div className={styles.cardContent}>
                  <p>Download our CSV template to see the required format:</p>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleDownloadTemplate}
                  >
                    <MdDownload /> Download CSV Template
                  </button>
                </div>
              </div>

              {/* Drop Zone */}
              <div
                className={`${styles.dropZone} ${isDark ? styles.dark : ''} ${dragActive ? styles.active : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className={styles.dropContent}>
                  <MdCloudUpload className={styles.dropIcon} />
                  <h3 className={styles.dropTitle}>Drag and drop your file here</h3>
                  <p className={styles.dropSubtitle}>or</p>
                  <label className="btn btn-primary">
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileSelect}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p className={styles.dropHint}>Supported formats: CSV, JSON</p>
                </div>
              </div>

              {/* Upload History */}
              {uploadedFiles.length > 0 && (
                <div className={`${styles.card} ${isDark ? styles.dark : ''}`}>
                  <div className={styles.cardHeader}>
                    <h2 className={styles.cardTitle}>Recent Uploads</h2>
                  </div>
                  <div className={styles.uploadHistory}>
                    {uploadedFiles.map(file => (
                      <div key={file.id} className={`${styles.historyItem} ${file.status}`}>
                        <div className={styles.historyInfo}>
                          <p className={styles.historyName}>{file.name}</p>
                          <p className={styles.historyMeta}>
                            {file.questionCount} questions • {file.uploadedAt}
                          </p>
                        </div>
                        <div className={styles.historyActions}>
                          <button className="btn btn-ghost btn-sm" title="View Details">
                            <MdVisibility />
                          </button>
                          <button 
                            className="btn btn-ghost btn-sm"
                            onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.id !== file.id))}
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Preview Section */
            <div className={`${styles.card} ${isDark ? styles.dark : ''}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Preview Questions ({previewData?.length})</h2>
              </div>
              <div className={styles.previewContainer}>
                {previewData?.slice(0, 5).map((q, idx) => (
                  <div key={idx} className={styles.previewItem}>
                    <div className={styles.previewHeader}>
                      <span className={styles.previewNumber}>Q{idx + 1}</span>
                      <span className={styles.previewMarks}>{q.marks || 5} Marks</span>
                    </div>
                    <p className={styles.previewQuestion}>{q.question}</p>
                    <div className={styles.previewOptions}>
                      {['optionA', 'optionB', 'optionC', 'optionD'].map((opt, i) => (
                        <div key={i} className={styles.previewOption}>
                          <span>{String.fromCharCode(65 + i)}.</span>
                          <span>{q[opt]}</span>
                          {q.correctAnswer === String.fromCharCode(65 + i) && (
                            <span className={styles.correctMark}>✓</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {previewData?.length > 5 && (
                  <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                    ... and {previewData.length - 5} more questions
                  </p>
                )}
              </div>

              <div className={styles.previewActions}>
                <button 
                  className="btn btn-secondary"
                  onClick={() => {
                    setPreviewMode(false);
                    setPreviewData(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={confirmUpload}
                >
                  <MdCheckCircle /> Confirm & Upload ({previewData?.length} Questions)
                </button>
              </div>
            </div>
          )}

          {/* Format Guide */}
          <div className={`${styles.card} ${isDark ? styles.dark : ''}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>CSV Format Guide</h2>
            </div>
            <div className={styles.cardContent}>
              <p>Your CSV file should contain the following columns:</p>
              <table className={styles.formatTable}>
                <thead>
                  <tr>
                    <th>Column Name</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>examId</code></td>
                    <td>Yes</td>
                    <td>ID of the exam (e.g., EXAM_001)</td>
                  </tr>
                  <tr>
                    <td><code>question</code></td>
                    <td>Yes</td>
                    <td>The question text</td>
                  </tr>
                  <tr>
                    <td><code>optionA, optionB, optionC, optionD</code></td>
                    <td>Yes</td>
                    <td>Four answer options</td>
                  </tr>
                  <tr>
                    <td><code>correctAnswer</code></td>
                    <td>Yes</td>
                    <td>Correct option (A, B, C, or D)</td>
                  </tr>
                  <tr>
                    <td><code>marks</code></td>
                    <td>No</td>
                    <td>Marks for the question (default: 5)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
