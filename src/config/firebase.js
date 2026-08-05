import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/**
 * Validates whether valid Firebase configuration keys are provided.
 * @returns {boolean}
 */
export function isFirebaseConfigured() {
  const { apiKey, projectId } = firebaseConfig;
  return Boolean(
    apiKey &&
    projectId &&
    apiKey !== 'your_api_key_here' &&
    projectId !== 'your_project_id' &&
    apiKey.trim() !== '' &&
    projectId.trim() !== ''
  );
}

// Initialize Firebase App instance safely
let app = null;
let auth = null;
let db = null;
let storage = null;
let analytics = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // Initialize Analytics if supported in the current environment
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });

    console.log('[ExamLens Firebase] Successfully initialized Firebase Services for project: examlens-84e91');
  } catch (error) {
    console.error('[ExamLens Firebase] Initialization error:', error);
  }
} else {
  console.warn(
    '[ExamLens Firebase] Environment keys not set or using placeholders. Operating in Mock/Local mode.'
  );
}

export { app, auth, db, storage, analytics };
