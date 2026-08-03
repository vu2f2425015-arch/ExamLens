import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authenticateStudent } from '../data/authService';

const AuthContext = createContext(null);

const initialState = {
  isAuthenticated: false,
  role: null, // 'admin' | 'student'
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

// Mock credentials for admin
const ADMIN_CREDENTIALS = {
  id: 'admin',
  password: 'admin123',
  user: {
    id: 'ADM001',
    name: 'Dr. Admin Kumar',
    email: 'admin@examlens.edu',
    role: 'admin',
    department: 'Examination Cell',
    avatar: null,
  },
};

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState, () => {
    try {
      const saved = sessionStorage.getItem('examlens_auth');
      return saved ? JSON.parse(saved) : initialState;
    } catch {
      return initialState;
    }
  });

  useEffect(() => {
    sessionStorage.setItem('examlens_auth', JSON.stringify(state));
  }, [state]);

  /**
   * Async signIn function for student credentials authentication.
   * In production: Swapped for Firebase Auth signInWithEmailAndPassword(auth, email, password).
   * Rejects with Error if account is not activated yet or credentials are invalid.
   *
   * @param {string} rollNumberOrEmail
   * @param {string} password
   * @returns {Promise<{ success: boolean, user: object }>}
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
   * Backward-compatible login helper supporting both admin and student roles.
   */
  const login = async (role, creds) => {
    const { id, password } = creds || {};
    if (role === 'admin') {
      if (id !== ADMIN_CREDENTIALS.id || password !== ADMIN_CREDENTIALS.password) {
        return { success: false, error: 'Invalid credentials. Please try again.' };
      }
      dispatch({ type: 'LOGIN', payload: { role: 'admin', user: ADMIN_CREDENTIALS.user } });
      return { success: true, user: ADMIN_CREDENTIALS.user };
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

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    sessionStorage.removeItem('examlens_auth');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

