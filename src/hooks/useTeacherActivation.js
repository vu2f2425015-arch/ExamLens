import { useState, useCallback } from 'react';
import { verifyTeacher as verifyRosterTeacher } from '../data/teachers';
import { activateTeacher as activateTeacherCreds } from '../data/authService';

/**
 * Custom hook for faculty / teacher account activation workflow.
 * Manages asynchronous verify and activate calls alongside loading & error states.
 */
export function useTeacherActivation() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [activateError, setActivateError] = useState(null);

  const loading = isVerifying || isActivating;
  const error = verifyError || activateError;

  /**
   * Verifies if an employee ID and email match an unactivated faculty roster record.
   *
   * @param {string} employeeId
   * @param {string} email
   * @returns {Promise<{ status: 'found'|'already_activated'|'not_found', teacher?: object }>}
   */
  const verifyTeacher = useCallback(async (employeeId, email) => {
    setIsVerifying(true);
    setVerifyError(null);
    try {
      const result = await verifyRosterTeacher(employeeId, email);
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
   * Activates teacher account with specified password.
   *
   * @param {string} employeeId
   * @param {string} password
   * @returns {Promise<{ success: boolean, teacher: object }>}
   */
  const activateTeacher = useCallback(async (employeeId, password) => {
    setIsActivating(true);
    setActivateError(null);
    try {
      const result = await activateTeacherCreds(employeeId, password);
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
    verifyTeacher,
    activateTeacher,
    loading,
    isVerifying,
    isActivating,
    error,
    verifyError,
    activateError,
    clearErrors,
  };
}
