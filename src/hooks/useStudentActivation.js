import { useState, useCallback } from 'react';
import { verifyStudent as verifyRosterStudent } from '../data/students';
import { activateStudent as activateStudentCreds } from '../data/authService';

/**
 * Custom hook for student account activation workflow.
 * Manages asynchronous verify and activate calls alongside loading & error states.
 * 
 * Signature and interface remain stable when swapping mock layer for Firebase Auth & Firestore.
 */
export function useStudentActivation() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [activateError, setActivateError] = useState(null);

  const loading = isVerifying || isActivating;
  const error = verifyError || activateError;

  /**
   * Verifies if a roll number and email match an unactivated roster record.
   *
   * @param {string} rollNumber
   * @param {string} email
   * @returns {Promise<{ status: 'found'|'already_activated'|'not_found', student?: object }>}
   */
  const verifyStudent = useCallback(async (rollNumber, email) => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const result = await verifyRosterStudent(rollNumber, email);
      return result;
    } catch (err) {
      const msg = err.message || 'Verification failed.';
      setVerifyError(msg);
      throw err;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  /**
   * Activates student account with specified password.
   *
   * @param {string} rollNumber
   * @param {string} password
   * @returns {Promise<{ success: boolean, student: object }>}
   */
  const activateStudent = useCallback(async (rollNumber, password) => {
    setIsActivating(true);
    setActivateError(null);
    try {
      const result = await activateStudentCreds(rollNumber, password);
      return result;
    } catch (err) {
      const msg = err.message || 'Activation failed.';
      setActivateError(msg);
      throw err;
    } finally {
      setIsActivating(false);
    }
  }, []);

  const clearErrors = useCallback(() => {
    setVerifyError(null);
    setActivateError(null);
  }, []);

  return {
    verifyStudent,
    activateStudent,
    loading,
    isVerifying,
    isActivating,
    error,
    verifyError,
    activateError,
    clearErrors,
  };
}
