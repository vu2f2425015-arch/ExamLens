/**
 * Computes SHA-256 hash of a string using Web Crypto API.
 * Used for client-side local mock credential verification.
 * 
 * @param {string} password 
 * @returns {Promise<string>} Hexadecimal hash string
 */
export async function hashPassword(password) {
  if (!password || typeof password !== 'string') return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
