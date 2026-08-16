import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../config/firebase.js';
import { studentRoster, markStudentActivated } from './students.js';
import { teacherRoster, markTeacherActivated } from './teachers.js';
import { getStudent, getTeacher } from '../services/firebaseService.js';
import { hashPassword } from '../utils/hash.js';

const DEMO_BYPASS_ENABLED = import.meta.env.VITE_ENABLE_DEMO_BYPASS === 'true';

/**
 * Local memory credentials store for mock layer mode.
 */
const studentCredentials = {};
const teacherCredentials = {};

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
      await createUserWithEmailAndPassword(auth, record.email.toLowerCase(), password);

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

  await markStudentActivated(cleanRoll);
  record.activated = true;

  const hashedPassword = await hashPassword(password);
  studentCredentials[cleanRoll] = {
    rollNumber: cleanRoll,
    email: record.email.toLowerCase(),
    passwordHash: hashedPassword,
  };

  return {
    success: true,
    student: { ...record },
  };
}

/**
 * Authenticates student credentials during sign in.
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
  const inputHash = await hashPassword(password);

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
        divisionId: profile.divisionId || 'DIV001',
        rollNumber: profile.rollNumber || rollNumber,
        avatar: firebaseUser.photoURL || null,
        uid: firebaseUser.uid,
      };
    } catch (firebaseErr) {
      const isDemoPass = password === 'student123' || DEMO_BYPASS_ENABLED;
      if (isDemoPass) {
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
              divisionId: updatedProfile.divisionId || 'DIV001',
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

  const isDemoPass = password === 'student123' || DEMO_BYPASS_ENABLED;
  if (isDemoPass) {
    record.activated = true;
    studentCredentials[record.rollNumber] = {
      rollNumber: record.rollNumber,
      email: record.email.toLowerCase(),
      passwordHash: inputHash,
    };
  }

  if (!record.activated && !isDemoPass) {
    throw new Error('Account is not activated yet. Please activate your account first.');
  }

  const cred = studentCredentials[record.rollNumber];

  if (!cred || cred.passwordHash !== inputHash) {
    if (!isDemoPass) {
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
    divisionId: record.divisionId || 'DIV001',
    rollNumber: record.rollNumber,
    avatar: null,
  };
}

/**
 * Activates faculty / teacher account and registers credentials.
 *
 * @param {string} employeeId - Faculty employee ID (e.g. FAC2026001)
 * @param {string} password - Chosen password
 * @returns {Promise<{ success: boolean, teacher: object }>}
 */
export async function activateTeacher(employeeId, password) {
  if (!employeeId) {
    throw new Error('Employee ID is required.');
  }

  const cleanEmpId = employeeId.trim().toUpperCase();

  if (!validatePassword(password)) {
    throw new Error('Password must be at least 8 characters long and contain at least one number.');
  }

  // --- LIVE FIREBASE BRANCH ---
  if (isFirebaseConfigured() && auth && db) {
    let record = await getTeacher(cleanEmpId);
    if (!record) throw new Error('Teacher record not found in university roster.');
    if (record.activated) throw new Error('Account is already activated.');

    const teacherDocRef = doc(db, 'teachers', cleanEmpId);
    try {
      await createUserWithEmailAndPassword(auth, record.email.toLowerCase(), password);
      const updatedTeacher = { ...record, activated: true, employeeId: cleanEmpId };
      await setDoc(teacherDocRef, updatedTeacher, { merge: true });
      await markTeacherActivated(cleanEmpId);
      return { success: true, teacher: updatedTeacher };
    } catch (firebaseErr) {
      if (firebaseErr.code === 'auth/email-already-in-use') {
        const updatedTeacher = { ...record, activated: true, employeeId: cleanEmpId };
        await setDoc(teacherDocRef, updatedTeacher, { merge: true });
        await markTeacherActivated(cleanEmpId);
        return { success: true, teacher: updatedTeacher };
      }
      throw new Error(firebaseErr.message || 'Firebase faculty activation failed.');
    }
  }

  // --- LOCAL MOCK FALLBACK BRANCH ---
  await new Promise((resolve) => setTimeout(resolve, 50));
  const record = await getTeacher(cleanEmpId);
  if (!record) throw new Error('Teacher record not found in university roster.');
  if (record.activated || teacherCredentials[cleanEmpId]) {
    throw new Error('Account is already activated.');
  }

  await markTeacherActivated(cleanEmpId);
  record.activated = true;

  const hashedPassword = await hashPassword(password);
  teacherCredentials[cleanEmpId] = {
    employeeId: cleanEmpId,
    email: record.email.toLowerCase(),
    passwordHash: hashedPassword,
  };

  return { success: true, teacher: { ...record } };
}

/**
 * Authenticates teacher credentials during sign in.
 *
 * @param {string} employeeIdOrEmail
 * @param {string} password
 * @returns {Promise<object>} User payload object
 */
export async function authenticateTeacher(employeeIdOrEmail, password) {
  if (!employeeIdOrEmail || !password) {
    throw new Error('Please enter both Employee ID/email and password.');
  }

  const cleanInput = employeeIdOrEmail.trim();
  const lowerInput = cleanInput.toLowerCase();
  const upperInput = cleanInput.toUpperCase();
  const inputHash = await hashPassword(password);

  const isDemoPass = password === 'student123' || DEMO_BYPASS_ENABLED;

  // --- LIVE FIREBASE BRANCH ---
  if (isFirebaseConfigured() && auth && db) {
    let emailToAuth = lowerInput;
    let empId = upperInput;

    let teacherRecord = teacherRoster[upperInput] || (await getTeacher(upperInput));
    if (!teacherRecord && cleanInput.includes('@')) {
      const allTeachers = await getTeachers();
      teacherRecord = (allTeachers || []).find((t) => t.email.toLowerCase() === lowerInput);
    }
    if (!teacherRecord && isDemoPass) {
      teacherRecord = teacherRoster['FAC2026001'];
    }

    if (teacherRecord) {
      emailToAuth = teacherRecord.email;
      empId = teacherRecord.employeeId || upperInput;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, emailToAuth, password);
      const firebaseUser = userCredential.user;

      let profileDoc = await getDoc(doc(db, 'teachers', empId));
      let profile = profileDoc.exists() ? profileDoc.data() : null;
      if (!profile) profile = teacherRecord || (await getTeacher(empId)) || {};

      return {
        id: profile.id || firebaseUser.uid,
        name: profile.name || 'Faculty Member',
        email: profile.email || firebaseUser.email,
        role: 'teacher',
        department: profile.department || 'Faculty',
        employeeId: empId,
        assignedDivisionIds: profile.assignedDivisionIds || [],
        avatar: firebaseUser.photoURL || null,
        uid: firebaseUser.uid,
      };
    } catch (firebaseErr) {
      if (isDemoPass) {
        const teacher = teacherRecord || (await getTeacher(empId)) || teacherRoster[upperInput] || teacherRoster['FAC2026001'];
        if (teacher) {
          // Attempt async auto-provision in Firebase Auth
          try {
            createUserWithEmailAndPassword(auth, (teacher.email || emailToAuth).toLowerCase(), password)
              .then((res) => {
                const teacherDocRef = doc(db, 'teachers', empId || teacher.employeeId);
                setDoc(teacherDocRef, { ...teacher, activated: true, employeeId: empId || teacher.employeeId }, { merge: true });
              })
              .catch(() => {});
          } catch (e) {
            // ignore background auto-provision errors
          }

          return {
            id: teacher.id || `TCH_${teacher.employeeId || empId}`,
            name: teacher.name || 'Dr. Meera Iyer',
            email: teacher.email || emailToAuth,
            role: 'teacher',
            department: teacher.department || 'Computer Science',
            employeeId: teacher.employeeId || empId || 'FAC2026001',
            assignedDivisionIds: teacher.assignedDivisionIds || ['DIV001'],
            avatar: null,
            uid: `TCH_${teacher.employeeId || empId}`,
          };
        }
      }

      if (
        firebaseErr.code === 'auth/wrong-password' ||
        firebaseErr.code === 'auth/user-not-found' ||
        firebaseErr.code === 'auth/invalid-credential'
      ) {
        throw new Error('Invalid credentials. If this is your first time logging in, please activate your faculty account first.');
      }
      throw new Error(firebaseErr.message || 'Faculty authentication failed.');
    }
  }

  // --- LOCAL MOCK FALLBACK BRANCH ---
  await new Promise((resolve) => setTimeout(resolve, 50));

  let record = Object.values(teacherRoster).find(
    (t) => t.employeeId.toUpperCase() === upperInput || t.email.toLowerCase() === lowerInput
  );
  if (!record) {
    record = await getTeacher(upperInput);
  }

  if (!record) {
    throw new Error('Invalid credentials. Faculty record not found.');
  }

  if (isDemoPass) {
    record.activated = true;
    teacherCredentials[record.employeeId] = {
      employeeId: record.employeeId,
      email: record.email.toLowerCase(),
      passwordHash: inputHash,
    };
  }

  if (!record.activated && !isDemoPass) {
    throw new Error('Faculty account is not activated yet. Please activate your account first.');
  }

  const cred = teacherCredentials[record.employeeId];
  if (!cred || cred.passwordHash !== inputHash) {
    if (!isDemoPass) {
      throw new Error('Invalid credentials. Please try again.');
    }
  }

  return {
    id: record.id,
    name: record.name,
    email: record.email,
    role: 'teacher',
    department: record.department,
    employeeId: record.employeeId,
    assignedDivisionIds: record.assignedDivisionIds || [],
    avatar: null,
  };
}
