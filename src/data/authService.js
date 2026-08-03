import { studentRoster, markStudentActivated } from './students.js';

/**
 * Mock Firebase Auth user credentials store.
 * NOTE: Plaintext password storage is used in mock layer ONLY.
 * In production: This is replaced by Firebase Auth (createUserWithEmailAndPassword / signInWithEmailAndPassword).
 */
const studentCredentials = {};

/**
 * Validates password format:
 * - Minimum 8 characters
 * - At least one number
 *
 * @param {string} password
 * @returns {boolean}
 */
function validatePassword(password) {
  if (typeof password !== 'string') return false;
  if (password.length < 8) return false;
  return /[0-9]/.test(password);
}

/**
 * Activates student account and registers credentials.
 * In production: Swapped for Firebase Auth `createUserWithEmailAndPassword(auth, email, password)`
 * plus Firestore update `updateDoc(doc(db, "students", rollNumber), { activated: true })`.
 *
 * @param {string} rollNumber - Student roll number
 * @param {string} password - Chosen password
 * @returns {Promise<{ success: boolean, student: object }>}
 */
export async function activateStudent(rollNumber, password) {
  // Return Promise to match future Firebase Auth createUserWithEmailAndPassword signature
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!rollNumber) {
    throw new Error('Roll number is required.');
  }

  const cleanRoll = rollNumber.trim().toUpperCase();
  const record = studentRoster[cleanRoll];

  if (!record) {
    throw new Error('Student record not found in university roster.');
  }

  if (record.activated || studentCredentials[cleanRoll]) {
    throw new Error('Account is already activated. Double activation is not allowed.');
  }

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long and contain at least one number.');
  }

  // Mark record activated in roster
  await markStudentActivated(cleanRoll);

  // Store credential entry in mock authentication layer
  // NOTE: Plaintext storage in mock. Replaced by Firebase Auth createUserWithEmailAndPassword in production.
  studentCredentials[cleanRoll] = {
    rollNumber: cleanRoll,
    email: record.email.toLowerCase(),
    password: password,
  };

  return {
    success: true,
    student: { ...studentRoster[cleanRoll] },
  };
}

/**
 * Authenticates student credentials during sign in.
 * In production: Swapped for Firebase Auth `signInWithEmailAndPassword(auth, email, password)`.
 *
 * @param {string} rollNumberOrEmail - Roll number or email
 * @param {string} password - Account password
 * @returns {Promise<object>} User payload object on successful authentication
 */
export async function authenticateStudent(rollNumberOrEmail, password) {
  // Return Promise to match future Firebase Auth signInWithEmailAndPassword signature
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!rollNumberOrEmail || !password) {
    throw new Error('Please enter both student ID/email and password.');
  }

  const cleanInput = rollNumberOrEmail.trim();
  const lowerInput = cleanInput.toLowerCase();
  const upperInput = cleanInput.toUpperCase();

  // Look up student in roster by rollNumber or email
  const record = Object.values(studentRoster).find(
    (s) => s.rollNumber.toUpperCase() === upperInput || s.email.toLowerCase() === lowerInput
  );

  if (!record) {
    throw new Error('Invalid credentials. Account not found.');
  }

  // Account must be activated before sign in is allowed
  if (!record.activated) {
    throw new Error('Account is not activated yet. Please activate your account first.');
  }

  const cred = studentCredentials[record.rollNumber];

  // NOTE: Plaintext comparison in mock layer. Replaced by Firebase Auth signInWithEmailAndPassword in production.
  if (!cred || cred.password !== password) {
    throw new Error('Invalid credentials. Please try again.');
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: 'student',
    department: record.department,
    semester: record.semester,
    rollNumber: record.rollNumber,
    avatar: null,
  };
}
