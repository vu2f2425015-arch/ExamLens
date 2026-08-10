import teachersData from './teachers.json';
import { getTeacher } from '../services/firebaseService.js';

/**
 * Memory roster store for faculty / teachers.
 * Keyed by employee ID (uppercase).
 */
export const teacherRoster = {};

// Initialize memory roster from teachers.json
teachersData.forEach((t) => {
  if (t.employeeId) {
    teacherRoster[t.employeeId.toUpperCase()] = { ...t };
  }
});

/**
 * Roster lookup logic for faculty verification.
 *
 * @param {string} employeeId - Faculty Employee ID (e.g. FAC2026001)
 * @param {string} email - Official faculty email
 * @returns {Promise<{ status: 'found'|'already_activated'|'not_found', teacher?: object }>}
 */
export async function verifyTeacher(employeeId, email) {
  if (!employeeId || !email) {
    return { status: 'not_found' };
  }

  const cleanEmpId = employeeId.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  const record = await getTeacher(cleanEmpId);

  if (!record) {
    return { status: 'not_found' };
  }

  if (!record.email || record.email.trim().toLowerCase() !== cleanEmail) {
    return { status: 'not_found' };
  }

  if (record.activated) {
    return { status: 'already_activated' };
  }

  return {
    status: 'found',
    teacher: { ...record },
  };
}

/**
 * Updates faculty activation status in memory roster.
 * @param {string} employeeId 
 */
export async function markTeacherActivated(employeeId) {
  const cleanEmpId = employeeId ? employeeId.trim().toUpperCase() : '';
  if (teacherRoster[cleanEmpId]) {
    teacherRoster[cleanEmpId].activated = true;
  }
}
