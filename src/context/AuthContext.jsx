import React, { createContext, useContext, useReducer, useEffect } from 'react';

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

// Mock credentials
const CREDENTIALS = {
  admin: {
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
  },
  student: {
    id: 'student',
    password: 'student123',
    user: {
      id: 'STU001',
      name: 'Arjun Sharma',
      email: 'arjun.sharma@examlens.edu',
      role: 'student',
      department: 'Computer Science',
      semester: 5,
      rollNumber: 'CS2021001',
      avatar: null,
    },
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

  const login = (role, { id, password }) => {
    const cred = CREDENTIALS[role];
    if (!cred) return { success: false, error: 'Invalid role' };
    if (cred.id !== id || cred.password !== password) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }
    dispatch({ type: 'LOGIN', payload: { role, user: cred.user } });
    return { success: true };
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    sessionStorage.removeItem('examlens_auth');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
