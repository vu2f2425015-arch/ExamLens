import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase.js';

// Fallback JSON / Mock Data
import examsData from '../data/exams.json';
import questionsData from '../data/questions.json';
import resultsData from '../data/results.json';
import alertsData from '../data/alerts.json';
import { studentRoster } from '../data/students.js';

/**
 * Timeout wrapper for async promises to prevent infinite hanging network calls.
 * @param {Promise} promise
 * @param {number} ms
 */
export function withTimeout(promise, ms = 3500) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms}ms`));
    }, ms);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

/**
 * Get custom imported students stored in browser LocalStorage.
 */
export function getLocalStorageStudents() {
  try {
    const data = localStorage.getItem('examlens_custom_students');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to read custom students from LocalStorage:', e);
    return [];
  }
}

/**
 * Save custom imported students to LocalStorage and update memory roster.
 */
export function saveLocalStorageStudents(studentsArray) {
  try {
    const existing = getLocalStorageStudents();
    const map = new Map();
    existing.forEach((s) => map.set(s.rollNumber, s));
    studentsArray.forEach((s) => map.set(s.rollNumber, s));
    const merged = Array.from(map.values());
    localStorage.setItem('examlens_custom_students', JSON.stringify(merged));

    // Also update in-memory student roster
    studentsArray.forEach((s) => {
      if (s.rollNumber) {
        studentRoster[s.rollNumber] = s;
      }
    });

    return merged;
  } catch (err) {
    console.error('LocalStorage save failed:', err);
    return [];
  }
}

/**
 * Fetch all documents from a Firestore collection with timeout.
 * @param {string} collectionName
 * @returns {Promise<Array|null>}
 */
export async function getCollection(collectionName) {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }
  try {
    const snapshot = await withTimeout(getDocs(collection(db, collectionName)), 3500);
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.warn(`[Firestore Warning] Fetch collection ${collectionName} failed or timed out:`, error);
    return null;
  }
}

/**
 * Fetch a single document by ID from Firestore with timeout.
 * @param {string} collectionName
 * @param {string} docId
 * @returns {Promise<object|null>}
 */
export async function getDocument(collectionName, docId) {
  if (!isFirebaseConfigured() || !db || !docId) {
    return null;
  }
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await withTimeout(getDoc(docRef), 3000);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.warn(`[Firestore Warning] Fetch document ${collectionName}/${docId} failed or timed out:`, error);
    return null;
  }
}

/**
 * Save or update a document in Firestore with timeout.
 * @param {string} collectionName
 * @param {string} docId
 * @param {object} data
 */
export async function saveDocument(collectionName, docId, data) {
  if (!isFirebaseConfigured() || !db) {
    return false;
  }
  try {
    const docRef = doc(db, collectionName, docId);
    await withTimeout(setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true }), 3500);
    return true;
  } catch (error) {
    console.warn(`[Firestore Warning] Save document ${collectionName}/${docId} failed:`, error);
    return false;
  }
}

// ----------------------------------------------------
// Specific Firestore Domain Services
// ----------------------------------------------------

/**
 * Get all students merged from static roster, LocalStorage, and Firestore.
 */
export async function getAllStudents() {
  const localCustom = getLocalStorageStudents();
  const defaultList = Object.values(studentRoster);
  const map = new Map();

  defaultList.forEach((s) => map.set(s.rollNumber, s));
  localCustom.forEach((s) => map.set(s.rollNumber, s));

  if (isFirebaseConfigured() && db) {
    try {
      const firestoreDocs = await getCollection('students');
      if (firestoreDocs && firestoreDocs.length > 0) {
        firestoreDocs.forEach((s) => {
          const roll = s.rollNumber || s.id;
          if (roll) map.set(roll, s);
        });
      }
    } catch (e) {
      console.warn('Firestore students fetch failed, using local roster.', e);
    }
  }

  return Array.from(map.values());
}

/**
 * Get student by roll number from Firestore, LocalStorage, or fallback roster.
 */
export async function getStudent(rollNumber) {
  if (!rollNumber) return null;
  const cleanRoll = rollNumber.trim().toUpperCase();

  const firestoreStudent = await getDocument('students', cleanRoll);
  if (firestoreStudent) return firestoreStudent;

  const localCustom = getLocalStorageStudents();
  const foundLocal = localCustom.find((s) => s.rollNumber === cleanRoll);
  if (foundLocal) return foundLocal;

  return studentRoster[cleanRoll] || null;
}

/**
 * Get all exams from Firestore or fallback JSON.
 */
export async function getExams() {
  const firestoreExams = await getCollection('exams');
  if (firestoreExams && firestoreExams.length > 0) {
    return firestoreExams;
  }
  return examsData;
}

/**
 * Get questions by exam ID from Firestore or fallback JSON.
 */
export async function getQuestions(examId) {
  if (isFirebaseConfigured() && db && examId) {
    try {
      const q = query(collection(db, 'questions'), where('examId', '==', examId));
      const snapshot = await withTimeout(getDocs(q), 3500);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      }
    } catch (error) {
      console.warn('[Firestore Warning] Questions fetch failed, falling back to local dataset.', error);
    }
  }
  return questionsData[examId] || [];
}

/**
 * Get student exam results from Firestore or fallback JSON.
 */
export async function getResults(studentId) {
  if (isFirebaseConfigured() && db && studentId) {
    try {
      const q = query(collection(db, 'results'), where('studentId', '==', studentId));
      const snapshot = await withTimeout(getDocs(q), 3500);
      if (!snapshot.empty) {
        return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
      }
    } catch (error) {
      console.warn('[Firestore Warning] Results fetch failed, falling back to local dataset.', error);
    }
  }
  if (!studentId) return resultsData;
  return resultsData.filter((res) => res.studentId === studentId);
}

/**
 * Save exam result submission to Firestore.
 */
export async function saveResult(resultData) {
  if (isFirebaseConfigured() && db) {
    try {
      const docRef = await withTimeout(
        addDoc(collection(db, 'results'), {
          ...resultData,
          submittedAt: new Date().toISOString(),
        }),
        3500
      );
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('[Firestore Error] Save result failed:', error);
    }
  }
  return { success: true, id: 'LOCAL_' + Date.now() };
}

/**
 * Fetch proctoring alerts from Firestore or fallback JSON.
 */
export async function getAlerts() {
  const firestoreAlerts = await getCollection('alerts');
  if (firestoreAlerts && firestoreAlerts.length > 0) {
    return firestoreAlerts;
  }
  return alertsData;
}

/**
 * Log a proctoring alert into Firestore.
 */
export async function logProctorAlert(alertData) {
  if (isFirebaseConfigured() && db) {
    try {
      await withTimeout(
        addDoc(collection(db, 'alerts'), {
          ...alertData,
          timestamp: new Date().toISOString(),
        }),
        3000
      );
      return true;
    } catch (error) {
      console.error('[Firestore Error] Log alert failed:', error);
    }
  }
  return false;
}

/**
 * Seeds initial mock data into Cloud Firestore if collections are empty.
 */
export async function seedFirestoreData() {
  if (!isFirebaseConfigured() || !db) {
    console.warn('[ExamLens Seed] Cannot seed Firestore: Firebase configuration is not set.');
    return { success: false, reason: 'Firebase configuration is missing.' };
  }

  try {
    console.log('[ExamLens Seed] Starting Firestore database seeding...');

    // Seed Students
    for (const [roll, student] of Object.entries(studentRoster)) {
      await saveDocument('students', roll, student);
    }

    // Seed Exams
    for (const exam of examsData) {
      await saveDocument('exams', exam.id, exam);
    }

    // Seed Results
    for (const res of resultsData) {
      await saveDocument('results', res.id, res);
    }

    // Seed Alerts
    for (const alert of alertsData) {
      await saveDocument('alerts', alert.id, alert);
    }

    console.log('[ExamLens Seed] Firestore seeding completed successfully.');
    return { success: true };
  } catch (error) {
    console.error('[ExamLens Seed] Error seeding Firestore:', error);
    return { success: false, error: error.message };
  }
}
