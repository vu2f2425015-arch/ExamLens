/**
 * Mock Firestore 'students' collection roster.
 * Keyed by roll number (uppercase) mirroring a Firestore document collection.
 * 
 * Note: No open self-registration — students only activate an existing record in this roster.
 * In production: Swapped for Firestore getDoc(doc(db, "students", rollNumber)).
 */
export const studentRoster = {};


import { getStudent } from '../services/firebaseService.js';

/**
 * Roster lookup logic — checks Cloud Firestore, LocalStorage, and static roster fallback.
 *
 * @param {string} rollNumber - Student roll number (e.g. CS2021001)
 * @param {string} email - Official student email (e.g. arjun.sharma@examlens.edu)
 * @returns {Promise<{ status: 'found'|'already_activated'|'not_found', student?: object }>}
 */
export async function verifyStudent(rollNumber, email) {
  if (!rollNumber || !email) {
    return { status: 'not_found' };
  }

  const cleanRoll = rollNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  // Dynamically lookup student from Firestore, LocalStorage, or mock roster
  const record = await getStudent(cleanRoll);

  if (!record) {
    return { status: 'not_found' };
  }

  // Both roll number and email must match the same record
  if (!record.email || record.email.trim().toLowerCase() !== cleanEmail) {
    return { status: 'not_found' };
  }

  if (record.activated) {
    return { status: 'already_activated' };
  }

  return {
    status: 'found',
    student: { ...record },
  };
}

/**
 * Updates roster activation status in mock Firestore collection.
 * Helper called internally upon successful account activation.
 */
export async function markStudentActivated(rollNumber) {
  const cleanRoll = rollNumber ? rollNumber.trim().toUpperCase() : '';
  if (studentRoster[cleanRoll]) {
    studentRoster[cleanRoll].activated = true;
  }
}

