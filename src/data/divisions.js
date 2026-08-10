import divisionsData from './divisions.json';

/**
 * Memory roster store for divisions.
 * Keyed by division ID (e.g., DIV001).
 */
export const divisionRoster = {};

// Initialize memory roster from divisions.json
divisionsData.forEach((div) => {
  divisionRoster[div.id] = { ...div };
});

/**
 * Fetches initial sync divisions list from memory roster.
 * @returns {Array<object>}
 */
export function getInitialDivisionsSync() {
  return Object.values(divisionRoster);
}

/**
 * Gets a division by ID from memory roster or fallback list.
 * @param {string} divisionId 
 * @returns {object|null}
 */
export function getDivisionById(divisionId) {
  if (!divisionId) return null;
  return divisionRoster[divisionId] || divisionsData.find((d) => d.id === divisionId) || null;
}
