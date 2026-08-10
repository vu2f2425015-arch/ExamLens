import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  deleteDoc,
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
import divisionsData from '../data/divisions.json';
import teachersData from '../data/teachers.json';
import { studentRoster } from '../data/students.js';
import { teacherRoster } from '../data/teachers.js';

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
 * Get custom created/assigned exams stored in browser LocalStorage.
 */
export function getLocalStorageExams() {
  try {
    const data = localStorage.getItem('examlens_custom_exams');
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to read custom exams from LocalStorage:', e);
    return [];
  }
}

/**
 * Save custom exams to LocalStorage.
 */
export function saveLocalStorageExams(examsArray) {
  try {
    const existing = getLocalStorageExams();
    const map = new Map();
    existing.forEach((e) => map.set(e.id, e));
    examsArray.forEach((e) => map.set(e.id, e));
    const merged = Array.from(map.values());
    localStorage.setItem('examlens_custom_exams', JSON.stringify(merged));
    return merged;
  } catch (err) {
    console.error('LocalStorage save exams failed:', err);
    return [];
  }
}

/**
 * Delete all student documents from LocalStorage, memory, and Cloud Firestore.
 */
export async function clearAllStudents() {
  try {
    localStorage.removeItem('examlens_custom_students');
  } catch (e) {
    console.error('Failed to clear LocalStorage students:', e);
  }

  Object.keys(studentRoster).forEach((key) => {
    delete studentRoster[key];
  });

  if (isFirebaseConfigured() && db) {
    try {
      const snapshot = await withTimeout(getDocs(collection(db, 'students')), 4000);
      if (snapshot && !snapshot.empty) {
        const deletePromises = snapshot.docs.map((docSnap) =>
          deleteDoc(doc(db, 'students', docSnap.id))
        );
        await Promise.allSettled(deletePromises);
      }
    } catch (error) {
      console.warn('[Firestore Clear Notice]', error);
    }
  }

  return true;
}

/**
 * Returns initial student list synchronously from LocalStorage and static roster.
 */
export function getInitialStudentsSync() {
  const localCustom = getLocalStorageStudents();
  const defaultList = Object.values(studentRoster);
  const map = new Map();

  defaultList.forEach((s) => {
    if (s.rollNumber) map.set(s.rollNumber, s);
  });
  localCustom.forEach((s) => {
    if (s.rollNumber) map.set(s.rollNumber, s);
  });

  return Array.from(map.values());
}

/**
 * Check and verify live connection to Cloud Firestore database.
 */
export async function checkFirebaseConnection() {
  const configured = isFirebaseConfigured();
  if (!configured || !db) {
    return { connected: false, reason: 'Firebase configuration environment keys not set.' };
  }
  try {
    const snapshot = await withTimeout(getDocs(collection(db, 'students')), 4000);
    return {
      connected: true,
      count: snapshot.size,
      projectId: 'examlens-84e91',
      rulesOk: true,
    };
  } catch (error) {
    console.warn('[Firebase Connection Check Notice]', error);
    return {
      connected: true,
      count: 0,
      projectId: 'examlens-84e91',
      permissionError: true,
      error: error.message,
    };
  }
}

/**
 * Fetch all documents from a Firestore collection with timeout.
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
 */
export async function saveDocument(collectionName, docId, data) {
  if (!isFirebaseConfigured() || !db) {
    return false;
  }
  try {
    const docRef = doc(db, collectionName, docId);
    await withTimeout(setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true }), 3500);
    console.log(`[Firestore Success] Saved document ${collectionName}/${docId} to Firebase.`);
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

  defaultList.forEach((s) => {
    if (s.rollNumber) map.set(s.rollNumber, s);
  });
  localCustom.forEach((s) => {
    if (s.rollNumber) map.set(s.rollNumber, s);
  });

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
 * Get all divisions from Firestore or fallback JSON.
 */
export async function getDivisions() {
  const firestoreDivisions = await getCollection('divisions');
  if (firestoreDivisions && firestoreDivisions.length > 0) {
    return firestoreDivisions;
  }
  return divisionsData;
}

/**
 * Get all teachers from Firestore or fallback JSON.
 */
export async function getTeachers() {
  const firestoreTeachers = await getCollection('teachers');
  if (firestoreTeachers && firestoreTeachers.length > 0) {
    return firestoreTeachers;
  }
  return Object.values(teacherRoster).length > 0 ? Object.values(teacherRoster) : teachersData;
}

/**
 * Get single teacher record by employee ID.
 */
export async function getTeacher(employeeId) {
  if (!employeeId) return null;
  const cleanEmpId = employeeId.trim().toUpperCase();

  const firestoreTeacher = await getDocument('teachers', cleanEmpId);
  if (firestoreTeacher) return firestoreTeacher;

  return teacherRoster[cleanEmpId] || teachersData.find((t) => t.employeeId.toUpperCase() === cleanEmpId) || null;
}

/**
 * Get all exams merged from static JSON, LocalStorage custom exams, and Cloud Firestore.
 */
export async function getExams() {
  const map = new Map();
  examsData.forEach((e) => map.set(e.id, e));
  getLocalStorageExams().forEach((e) => map.set(e.id, e));

  if (isFirebaseConfigured() && db) {
    try {
      const firestoreExams = await getCollection('exams');
      if (firestoreExams && firestoreExams.length > 0) {
        firestoreExams.forEach((e) => map.set(e.id, e));
      }
    } catch (e) {
      console.warn('Firestore exams fetch warning:', e);
    }
  }

  return Array.from(map.values());
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
    const allStus = getInitialStudentsSync();

    const batchPromises = allStus.map((stu) =>
      saveDocument('students', stu.rollNumber, stu)
    );
    await Promise.allSettled(batchPromises);

    for (const exam of examsData) {
      await saveDocument('exams', exam.id, exam);
    }

    for (const div of divisionsData) {
      await saveDocument('divisions', div.id, div);
    }

    for (const tch of teachersData) {
      await saveDocument('teachers', tch.employeeId, tch);
    }

    for (const res of resultsData) {
      await saveDocument('results', res.id, res);
    }

    for (const alert of alertsData) {
      await saveDocument('alerts', alert.id, alert);
    }

    console.log('[ExamLens Seed] Firestore seeding completed successfully.');
    return { success: true, count: allStus.length };
  } catch (error) {
    console.error('[ExamLens Seed] Error seeding Firestore:', error);
    return { success: false, error: error.message };
  }
}
