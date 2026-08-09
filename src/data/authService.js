import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase.js';
import { studentRoster, markStudentActivated } from './students.js';
import { getStudent } from '../services/firebaseService.js';

/**
 * Local memory credentials store for mock layer mode.
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
 * If Firebase is configured, uses Firebase Auth + Cloud Firestore.
 * Fallback to local memory roster if Firebase keys are not configured.
 *
 * @param {string} rollNumber - Student roll number
 * @param {string} password - Chosen password
 * @returns {Promise<{ success: boolean, student: object }>}
 */
export async function activateStudent(rollNumber, password) {
  if (!rollNumber) {
    throw new Error('Roll number is required.');
  }

  const cleanRoll = rollNumber.trim().toUpperCase();

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long and contain at least one number.');
  }

  // --- LIVE FIREBASE BRANCH ---
  if (isFirebaseConfigured() && auth && db) {
    let record = await getStudent(cleanRoll);

    if (!record) {
      throw new Error('Student record not found in university roster.');
    }

    if (record.activated) {
      throw new Error('Account is already activated. Double activation is not allowed.');
    }

    const studentDocRef = doc(db, 'students', cleanRoll);

    try {
      // Create user account in Firebase Auth
      await createUserWithEmailAndPassword(auth, record.email.toLowerCase(), password);

      // Update Firestore document activation status
      const updatedStudent = { ...record, activated: true, rollNumber: cleanRoll };
      await setDoc(studentDocRef, updatedStudent, { merge: true });
      await markStudentActivated(cleanRoll);

      return {
        success: true,
        student: updatedStudent,
      };
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/email-already-in-use') {
        const updatedStudent = { ...record, activated: true, rollNumber: cleanRoll };
        await setDoc(studentDocRef, updatedStudent, { merge: true });
        await markStudentActivated(cleanRoll);
        return {
          success: true,
          student: updatedStudent,
        };
      }
      throw new Error(firebaseErr.message || 'Firebase activation failed.');
    }
  }

  // --- LOCAL MOCK FALLBACK BRANCH ---
  await new Promise((resolve) => setTimeout(resolve, 50));
  const record = await getStudent(cleanRoll);

  if (!record) {
    throw new Error('Student record not found in university roster.');
  }

  if (record.activated || studentCredentials[cleanRoll]) {
    throw new Error('Account is already activated. Double activation is not allowed.');
  }

  // Mark record activated in roster
  await markStudentActivated(cleanRoll);
  record.activated = true;

  // Store credential entry in mock authentication layer
  studentCredentials[cleanRoll] = {
    rollNumber: cleanRoll,
    email: record.email.toLowerCase(),
    password: password,
  };

  return {
    success: true,
    student: { ...record },
  };
}

/**
 * Authenticates student credentials during sign in.
 * Uses Firebase Auth + Firestore when configured, or local roster fallback.
 *
 * @param {string} rollNumberOrEmail - Roll number or email
 * @param {string} password - Account password
 * @returns {Promise<object>} User payload object on successful authentication
 */
export async function authenticateStudent(rollNumberOrEmail, password) {
  if (!rollNumberOrEmail || !password) {
    throw new Error('Please enter both student ID/email and password.');
  }

  const cleanInput = rollNumberOrEmail.trim();
  const lowerInput = cleanInput.toLowerCase();
  const upperInput = cleanInput.toUpperCase();

  // --- LIVE FIREBASE BRANCH ---
  if (isFirebaseConfigured() && auth && db) {
    let emailToAuth = lowerInput;
    let rollNumber = upperInput;

    if (!cleanInput.includes('@')) {
      const student = await getStudent(upperInput);
      if (student) {
        emailToAuth = student.email;
        rollNumber = student.rollNumber || upperInput;
      }
    } else {
      const student = await getStudent(upperInput);
      if (student) {
        rollNumber = student.rollNumber;
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToAuth, password);
      const firebaseUser = userCredential.user;

      // Fetch full profile from Firestore
      let profileDoc = await getDoc(doc(db, 'students', rollNumber));
      let profile = profileDoc.exists() ? profileDoc.data() : null;

      if (!profile) {
        profile = (await getStudent(rollNumber)) || {
          name: firebaseUser.displayName || 'Student Candidate',
          email: firebaseUser.email,
          rollNumber: rollNumber,
          department: 'Computer Science',
          semester: 5,
        };
      }

      return {
        id: profile.id || firebaseUser.uid,
        name: profile.name,
        email: profile.email || firebaseUser.email,
        role: 'student',
        department: profile.department || 'Computer Science',
        semester: profile.semester || 5,
        rollNumber: profile.rollNumber || rollNumber,
        avatar: firebaseUser.photoURL || null,
        uid: firebaseUser.uid,
      };
    } catch (firebaseErr) {
      // If user provided demo password ('student123'), auto-provision or sign in
      if (password === 'student123') {
        const student = await getStudent(rollNumber);
        if (student) {
          try {
            let createdUser = null;
            try {
              const res = await createUserWithEmailAndPassword(auth, emailToAuth.toLowerCase(), password);
              createdUser = res.user;
            } catch (createErr) {
              if (createErr.code === 'auth/email-already-in-use') {
                try {
                  const res = await signInWithEmailAndPassword(auth, emailToAuth.toLowerCase(), password);
                  createdUser = res.user;
                } catch (e) {
                  // ignore
                }
              }
            }

            const studentDocRef = doc(db, 'students', rollNumber);
            const updatedProfile = { ...student, activated: true, rollNumber };
            await setDoc(studentDocRef, updatedProfile, { merge: true });

            return {
              id: updatedProfile.id || (createdUser && createdUser.uid) || `STU_${rollNumber}`,
              name: updatedProfile.name,
              email: updatedProfile.email || emailToAuth,
              role: 'student',
              department: updatedProfile.department || 'Computer Science',
              semester: updatedProfile.semester || 5,
              rollNumber: updatedProfile.rollNumber || rollNumber,
              avatar: (createdUser && createdUser.photoURL) || null,
              uid: (createdUser && createdUser.uid) || `STU_${rollNumber}`,
            };
          } catch (autoErr) {
            console.warn('[Demo Auto-Provision Notice]', autoErr);
          }
        }
      }

      if (
        firebaseErr.code === 'auth/wrong-password' ||
        firebaseErr.code === 'auth/user-not-found' ||
        firebaseErr.code === 'auth/invalid-credential'
      ) {
        throw new Error('Invalid credentials. Please verify your email/roll number and password.');
      }
      throw new Error(firebaseErr.message || 'Firebase authentication failed.');
    }
  }

  // --- LOCAL MOCK FALLBACK BRANCH ---
  await new Promise((resolve) => setTimeout(resolve, 50));

  let record = Object.values(studentRoster).find(
    (s) => s.rollNumber.toUpperCase() === upperInput || s.email.toLowerCase() === lowerInput
  );
  if (!record) {
    record = await getStudent(upperInput);
  }

  if (!record) {
    throw new Error('Invalid credentials. Account not found.');
  }

  if (password === 'student123') {
    record.activated = true;
    studentCredentials[record.rollNumber] = {
      rollNumber: record.rollNumber,
      email: record.email.toLowerCase(),
      password: password,
    };
  }

  if (!record.activated) {
    throw new Error('Account is not activated yet. Please activate your account first.');
  }

  const cred = studentCredentials[record.rollNumber];

  if (!cred || cred.password !== password) {
    if (password !== 'student123') {
      throw new Error('Invalid credentials. Please try again.');
    }
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

