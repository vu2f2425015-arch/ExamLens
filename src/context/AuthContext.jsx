import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { authenticateStudent, authenticateTeacher } from '../data/authService';
import { hashPassword } from '../utils/hash';

const AuthContext = createContext(null);

const ADMIN_ID = import.meta.env.VITE_ADMIN_ID || 'admin';
const ADMIN_PASSWORD_HASH =
  import.meta.env.VITE_ADMIN_PASSWORD_HASH ||
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'; // default SHA-256 for 'admin123'

const DEFAULT_ADMIN_USER = {
  id: 'ADM001',
  name: 'Dr. Admin Kumar',
  email: 'admin@examlens.edu',
  role: 'admin',
  department: 'Examination Cell',
  avatar: null,
};

const initialState = {
  isAuthenticated: false,
  role: null, // 'admin' | 'teacher' | 'student'
  user: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        role: action.payload.role,
        user: action.payload.user,
      };
    case 'LOGOUT':
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const saved = sessionStorage.getItem('examlens_auth');
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  // Sync auth state changes with sessionStorage
  useEffect(() => {
    sessionStorage.setItem('examlens_auth', JSON.stringify(state));
  }, [state]);

  // Subscribe to Firebase Auth changes when Firebase is configured
  useEffect(() => {
    if (!isFirebaseConfigured() || !auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        dispatch({
          type: 'LOGIN',
          payload: {
            role: 'student',
            user: {
              id: firebaseUser.uid,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              role: 'student',
            },
          },
        });
      }
    });

    return () => unsubscribe();
  }, []);

  /**
   * Async signIn function for student authentication.
   */
  const signIn = async (rollNumberOrEmail, password) => {
    try {
      const user = await authenticateStudent(rollNumberOrEmail, password);
      dispatch({ type: 'LOGIN', payload: { role: 'student', user } });
      return { success: true, user };
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * Async signIn function for teacher authentication.
   */
  const signInTeacher = async (employeeIdOrEmail, password) => {
    try {
      const user = await authenticateTeacher(employeeIdOrEmail, password);
      dispatch({ type: 'LOGIN', payload: { role: 'teacher', user } });
      return { success: true, user };
    } catch (err) {
      return Promise.reject(err);
    }
  };

  /**
   * Multi-role login helper supporting admin, teacher, and student roles.
   */
  const login = async (role, creds) => {
    const { id, password } = creds || {};

    if (role === 'admin') {
      const hashedInput = await hashPassword(password);
      if (id !== ADMIN_ID || hashedInput !== ADMIN_PASSWORD_HASH) {
        return { success: false, error: 'Invalid admin credentials. Please try again.' };
      }
      dispatch({ type: 'LOGIN', payload: { role: 'admin', user: DEFAULT_ADMIN_USER } });
      return { success: true, user: DEFAULT_ADMIN_USER };
    }

    if (role === 'teacher') {
      try {
        const res = await signInTeacher(id, password);
        return res;
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    if (role === 'student') {
      try {
        const res = await signIn(id, password);
        return res;
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    return { success: false, error: 'Invalid role' };
  };

  const logout = async () => {
    if (isFirebaseConfigured() && auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        console.error('[Firebase Auth] Logout error:', e);
      }
    }
    dispatch({ type: 'LOGOUT' });
    sessionStorage.removeItem('examlens_auth');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signIn, signInTeacher, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
