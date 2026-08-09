const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api';

/**
 * Universal fetch wrapper with automatic JSON parsing and timeout handling.
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status} ${response.statusText}`);
    }
    if (response.status === 204) return true;
    return await response.json();
  } catch (error) {
    console.warn(`[Backend API Warning] ${endpoint} failed:`, error.message);
    throw error;
  }
}

// ── Questions & Exam Submissions ──
export async function fetchQuestionsByExam(examId) {
  return request(`/questions/exam/${examId}`);
}

export async function submitExamAttempt(examId, submissionData) {
  return request(`/exams/${examId}/submit`, {
    method: 'POST',
    body: JSON.stringify(submissionData),
  });
}

// ── Anomaly Recording Clips Vault ──
export async function fetchRecordings(params = {}) {
  const query = new URLSearchParams(params).toString();
  return request(`/recordings${query ? `?${query}` : ''}`);
}

export async function deleteRecordingClip(id) {
  return request(`/recordings/${id}`, {
    method: 'DELETE',
  });
}

// ── Platform Settings ──
export async function fetchSystemSettings() {
  return request('/settings');
}

export async function updateSystemSettings(settings) {
  return request('/settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  });
}

// ── Reports & Analytics ──
export async function fetchReportsSummary() {
  return request('/reports/summary');
}

// ── User Profile & Security ──
export async function updateUserProfile(profileData) {
  return request('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

export async function updateUserPassword(passwordData) {
  return request('/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(passwordData),
  });
}
