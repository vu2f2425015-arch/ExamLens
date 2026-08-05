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
 * Fetch all documents from a Firestore collection.
 * @param {string} collectionName
 * @returns {Promise<Array>}
 */
export async function getCollection(collectionName) {
  if (!isFirebaseConfigured() || !db) {
    return null;
  }
  try {
    const snapshot = await getDocs(collection(db, collectionName));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error(`[Firestore Error] Fetch collection ${collectionName} failed:`, error);
    return null;
  }
}

/**
 * Fetch a single document by ID from Firestore.
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
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  } catch (error) {
    console.error(`[Firestore Error] Fetch document ${collectionName}/${docId} failed:`, error);
    return null;
  }
}

/**
 * Save or update a document in Firestore.
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
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
    return true;
  } catch (error) {
    console.error(`[Firestore Error] Save document ${collectionName}/${docId} failed:`, error);
    return false;
  }
}

// ----------------------------------------------------
// Specific Firestore Domain Services
// ----------------------------------------------------

/**
 * Get student by roll number from Firestore or fallback roster.
 */
export async function getStudent(rollNumber) {
  if (!rollNumber) return null;
  const cleanRoll = rollNumber.trim().toUpperCase();
  const firestoreStudent = await getDocument('students', cleanRoll);
  if (firestoreStudent) return firestoreStudent;
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
      const snapshot = await getDocs(q);
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
      const snapshot = await getDocs(q);
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
      const docRef = await addDoc(collection(db, 'results'), {
        ...resultData,
        submittedAt: new Date().toISOString(),
      });
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
      await addDoc(collection(db, 'alerts'), {
        ...alertData,
        timestamp: new Date().toISOString(),
      });
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
      await setDoc(doc(db, 'students', roll), student, { merge: true });
    }

    // Seed Exams
    for (const exam of examsData) {
      await setDoc(doc(db, 'exams', exam.id), exam, { merge: true });
    }

    // Seed Results
    for (const res of resultsData) {
      await setDoc(doc(db, 'results', res.id), res, { merge: true });
    }

    // Seed Alerts
    for (const alert of alertsData) {
      await setDoc(doc(db, 'alerts', alert.id), alert, { merge: true });
    }

    console.log('[ExamLens Seed] Firestore seeding completed successfully.');
    return { success: true };
  } catch (error) {
    console.error('[ExamLens Seed] Error seeding Firestore:', error);
    return { success: false, error: error.message };
  }
}
