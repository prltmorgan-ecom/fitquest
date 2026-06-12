// ─── État global + sauvegarde localStorage ──────────────────────────────────
import { levelFromXp } from './xp.js';

const KEY = 'fitquest-save-v1';

const defaultState = {
  profile: null,        // { name, sports: [], days: [], weeklyMix: {sport: n}, createdAt }
  xp: 0,
  skin: 'neon',
  streak: { count: 0, lastDate: null, best: 0 },
  history: [],          // [{ date, programName, dayName, xp, durationMin, exercisesDone }]
  customPrograms: [],   // programmes créés par l'utilisateur
  activeProgramId: null, // v1 — migré vers activePrograms
  activePrograms: {},   // un programme actif par sport : { salle: id, course: id, street: id }
  nutrition: null,      // { sexe, age, poids, taille, objectif }
  session: null,        // séance en cours { programId, dayIndex, checked: [], startedAt }
};

export const state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch (e) { /* sauvegarde corrompue → on repart de zéro */ }
  return structuredClone(defaultState);
}

export function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function resetAll() {
  localStorage.removeItem(KEY);
  Object.assign(state, structuredClone(defaultState));
}

export function playerLevel() {
  return levelFromXp(state.xp);
}

// Met à jour la streak (série de jours consécutifs avec séance) et la renvoie.
export function bumpStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const last = state.streak.lastDate;
  if (last === today) return state.streak.count; // déjà une séance aujourd'hui
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.streak.count = last === yesterday ? state.streak.count + 1 : 1;
  state.streak.lastDate = today;
  state.streak.best = Math.max(state.streak.best, state.streak.count);
  return state.streak.count;
}

// La streak est-elle encore vivante (séance aujourd'hui ou hier) ?
export function streakAlive() {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return state.streak.lastDate === today || state.streak.lastDate === yesterday;
}
