/**
 * Mock Firestore 'students' collection roster.
 * Keyed by roll number (uppercase) mirroring a Firestore document collection.
 * 
 * Note: No open self-registration — students only activate an existing record in this roster.
 * In production: Swapped for Firestore getDoc(doc(db, "students", rollNumber)).
 */
export const studentRoster = {
  'CS2021001': {
    id: 'STU001',
    rollNumber: 'CS2021001',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@examlens.edu',
    department: 'Computer Science',
    semester: 5,
    status: 'active',
    activated: false,
    phone: '+91 98765 43210',
    joinDate: '2021-08-01',
    gpa: 8.7,
  },
  'EC2021002': {
    id: 'STU002',
    rollNumber: 'EC2021002',
    name: 'Priya Mehta',
    email: 'priya.mehta@examlens.edu',
    department: 'Electronics',
    semester: 5,
    status: 'active',
    activated: false,
    phone: '+91 87654 32109',
    joinDate: '2021-08-01',
    gpa: 9.1,
  },
  'ME2021003': {
    id: 'STU003',
    rollNumber: 'ME2021003',
    name: 'Rahul Verma',
    email: 'rahul.verma@examlens.edu',
    department: 'Mechanical',
    semester: 5,
    status: 'active',
    activated: false,
    phone: '+91 76543 21098',
    joinDate: '2021-08-01',
    gpa: 7.9,
  },
  'CS2021004': {
    id: 'STU004',
    rollNumber: 'CS2021004',
    name: 'Sneha Patel',
    email: 'sneha.patel@examlens.edu',
    department: 'Computer Science',
    semester: 5,
    status: 'active',
    activated: false,
    phone: '+91 65432 10987',
    joinDate: '2021-08-01',
    gpa: 8.4,
  },
  'CE2022005': {
    id: 'STU005',
    rollNumber: 'CE2022005',
    name: 'Karan Singh',
    email: 'karan.singh@examlens.edu',
    department: 'Civil',
    semester: 3,
    status: 'active',
    activated: false,
    phone: '+91 54321 09876',
    joinDate: '2022-08-01',
    gpa: 7.5,
  },
  'CS2020006': {
    id: 'STU006',
    rollNumber: 'CS2020006',
    name: 'Ananya Roy',
    email: 'ananya.roy@examlens.edu',
    department: 'Computer Science',
    semester: 7,
    status: 'active',
    activated: false,
    phone: '+91 43210 98765',
    joinDate: '2020-08-01',
    gpa: 9.4,
  },
  'IT2021007': {
    id: 'STU007',
    rollNumber: 'IT2021007',
    name: 'Vikram Nair',
    email: 'vikram.nair@examlens.edu',
    department: 'Information Technology',
    semester: 5,
    status: 'inactive',
    activated: false,
    phone: '+91 32109 87654',
    joinDate: '2021-08-01',
    gpa: 6.8,
  },
  'EC2021008': {
    id: 'STU008',
    rollNumber: 'EC2021008',
    name: 'Divya Krishnan',
    email: 'divya.krishnan@examlens.edu',
    department: 'Electronics',
    semester: 5,
    status: 'active',
    activated: false,
    phone: '+91 21098 76543',
    joinDate: '2021-08-01',
    gpa: 8.9,
  },
};

/**
 * Roster lookup logic — completely separate from credentials & auth logic.
 * In production: Swapped for Firestore getDoc(doc(db, "students", rollNumber)).
 *
 * @param {string} rollNumber - Student roll number (e.g. CS2021001)
 * @param {string} email - Official student email (e.g. arjun.sharma@examlens.edu)
 * @returns {Promise<{ status: 'found'|'already_activated'|'not_found', student?: object }>}
 */
export async function verifyStudent(rollNumber, email) {
  // Return Promise to match future Firestore async getDoc signature
  await new Promise((resolve) => setTimeout(resolve, 50));

  if (!rollNumber || !email) {
    return { status: 'not_found' };
  }

  const cleanRoll = rollNumber.trim().toUpperCase();
  const cleanEmail = email.trim().toLowerCase();

  const record = studentRoster[cleanRoll];

  if (!record) {
    return { status: 'not_found' };
  }

  // Both roll number and email must match the same record
  if (record.email.toLowerCase() !== cleanEmail) {
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
