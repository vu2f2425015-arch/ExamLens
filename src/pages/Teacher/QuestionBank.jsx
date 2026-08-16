import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar/Navbar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { saveDocument } from '../../services/firebaseService';
import styles from './QuestionBank.module.css';
import {
  MdAdd, MdDelete, MdEdit, MdSave, MdClose, MdSearch, MdCheckCircle, MdCancel
} from 'react-icons/md';

export default function QuestionBank() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [questions, setQuestions] = useState([]);
  const [exams, setExams] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    examId: '',
    question: '',
    options: ['', '', '', ''],
    correctOption: 0,
    marks: 5,
  });

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        // Load exams created by this teacher
        const teacherExams = [
          { id: 'EXAM_001', name: 'Data Structures & Algorithms', subject: 'CS301' },
          { id: 'EXAM_002', name: 'Database Management Systems', subject: 'CS302' },
          { id: 'EXAM_003', name: 'Computer Networks', subject: 'CS303' },
        ];
        setExams(teacherExams);

        // Mock questions from localStorage
        const stored = localStorage.getItem('teacherQuestions');
        if (stored) {
          setQuestions(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    }
    loadData();
  }, []);

  const handleOpenModal = (examId = '', question = null) => {
    setFormData({
      examId: examId || '',
      question: question?.question || '',
      options: question?.options || ['', '', '', ''],
      correctOption: question?.correctOption || 0,
      marks: question?.marks || 5,
    });
    setEditingId(question?.id || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      examId: '',
      question: '',
      options: ['', '', '', ''],
      correctOption: 0,
      marks: 5,
    });
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!formData.examId || !formData.question || formData.options.some(o => !o)) {
      alert('Please fill all required fields and all options.');
      return;
    }

    const questionData = {
      id: editingId || `Q_${Date.now()}`,
      ...formData,
      marks: parseInt(formData.marks, 10),
      correctOption: parseInt(formData.correctOption, 10),
    };

    let updatedQuestions;
    if (editingId) {
      updatedQuestions = questions.map(q => q.id === editingId ? questionData : q);
    } else {
      updatedQuestions = [...questions, questionData];
    }

    setQuestions(updatedQuestions);
    localStorage.setItem('teacherQuestions', JSON.stringify(updatedQuestions));
    
    // Save to Firestore
    await saveDocument('questions', questionData.id, questionData).catch(() => {});

    handleCloseModal();
  };

  const handleDeleteQuestion = (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      const updated = questions.filter(q => q.id !== id);
      setQuestions(updated);
      localStorage.setItem('teacherQuestions', JSON.stringify(updated));
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const filteredQuestions = questions.filter(q => {
    const matchesExam = !selectedExam || q.examId === selectedExam;
    const matchesSearch = q.question.toLowerCase().includes(search.toLowerCase());
    return matchesExam && matchesSearch;
  });

  return (
    <>
      <Navbar title="Question Bank Manager" />
      <main className="page-body">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title">Question Bank Manager</h1>
            <p className="page-subtitle">Create and manage questions for your examination papers</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
          >
            <MdAdd /> Add New Question
          </button>
        </div>

        {/* Filters Section */}
        <div className={`${styles.filtersSection} ${isDark ? styles.dark : ''}`}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Exam Paper</label>
            <select
              value={selectedExam}
              onChange={(e) => setSelectedExam(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Exams</option>
              {exams.map(exam => (
                <option key={exam.id} value={exam.id}>
                  {exam.name} ({exam.subject})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Search Questions</label>
            <div className="input-wrapper">
              <MdSearch className="input-icon" />
              <input
                type="text"
                className="form-input"
                placeholder="Search question text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className={`${styles.questionsContainer} ${isDark ? styles.dark : ''}`}>
          <div className={styles.containerHeader}>
            <h2 className={styles.containerTitle}>Questions ({filteredQuestions.length})</h2>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No questions found. Create your first question to get started!</p>
            </div>
          ) : (
            <div className={styles.questionsList}>
              {filteredQuestions.map((q, idx) => (
                <div key={q.id} className={`${styles.questionCard} ${isDark ? styles.dark : ''}`}>
                  <div className={styles.qCardHeader}>
                    <div className={styles.qCardNumber}>Q{idx + 1}</div>
                    <div className={styles.qCardMeta}>
                      <span className={styles.qCardMarks}>{q.marks} Marks</span>
                      <span className={styles.qCardExam}>
                        {exams.find(e => e.id === q.examId)?.subject || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <p className={styles.qCardText}>{q.question}</p>

                  <div className={styles.optionsGrid}>
                    {q.options.map((opt, idx) => (
                      <div
                        key={idx}
                        className={`${styles.optionItem} ${
                          idx === q.correctOption ? styles.correct : ''
                        }`}
                      >
                        <span className={styles.optionLetter}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={styles.optionText}>{opt}</span>
                        {idx === q.correctOption && (
                          <MdCheckCircle className={styles.correctIcon} />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className={styles.qCardActions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => handleOpenModal(q.examId, q)}
                      title="Edit"
                    >
                      <MdEdit /> Edit
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.danger}`}
                      onClick={() => handleDeleteQuestion(q.id)}
                      title="Delete"
                    >
                      <MdDelete /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {isModalOpen && (
          <div className={styles.modal}>
            <div className={`${styles.modalContent} ${isDark ? styles.dark : ''}`}>
              <div className={styles.modalHeader}>
                <h2 className={styles.modalTitle}>
                  {editingId ? 'Edit Question' : 'Create New Question'}
                </h2>
                <button
                  className="btn btn-ghost btn-sm btn-icon"
                  onClick={handleCloseModal}
                >
                  <MdClose size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveQuestion} className={styles.modalBody}>
                <div className="form-group">
                  <label className="form-label">Exam Paper *</label>
                  <select
                    value={formData.examId}
                    onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                    className="form-input"
                    required
                  >
                    <option value="">Select Exam</option>
                    {exams.map(exam => (
                      <option key={exam.id} value={exam.id}>
                        {exam.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Question Text *</label>
                  <textarea
                    rows="3"
                    className="form-input"
                    placeholder="Enter the question..."
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.optionsSection}>
                  <label className="form-label">Options *</label>
                  {formData.options.map((option, idx) => (
                    <div key={idx} className={styles.optionInput}>
                      <label className={styles.optionLabel}>
                        {String.fromCharCode(65 + idx)}
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                        value={option}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        required
                      />
                      <label className={styles.radioLabel}>
                        <input
                          type="radio"
                          name="correctOption"
                          value={idx}
                          checked={formData.correctOption === idx}
                          onChange={(e) => setFormData({ ...formData, correctOption: parseInt(e.target.value, 10) })}
                        />
                        Correct
                      </label>
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label className="form-label">Marks *</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    className="form-input"
                    placeholder="e.g. 5"
                    value={formData.marks}
                    onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                    required
                  />
                </div>

                <div className={styles.modalFooter}>
                  <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <MdSave /> {editingId ? 'Update' : 'Create'} Question
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
