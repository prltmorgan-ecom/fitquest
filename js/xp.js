// ─── Moteur d'XP : niveaux 1 → 200, rangs, skins ───────────────────────────

export const MAX_LEVEL = 200;

// XP nécessaire pour passer du niveau n au niveau n+1.
// Progression lente et longue : ~1 séance pour le niveau 2,
// mais ~258 000 XP au total pour atteindre le niveau 200 (plusieurs années d'entraînement).
export function xpForNext(level) {
  return 100 + 12 * level;
}

// XP cumulée nécessaire pour atteindre un niveau donné depuis le niveau 1.
export function totalXpForLevel(level) {
  let total = 0;
  for (let n = 1; n < level; n++) total += xpForNext(n);
  return total;
}

// Calcule le niveau et la progression à partir de l'XP totale.
export function levelFromXp(xp) {
  let level = 1;
  let rest = xp;
  while (level < MAX_LEVEL && rest >= xpForNext(level)) {
    rest -= xpForNext(level);
    level++;
  }
  const need = level >= MAX_LEVEL ? 0 : xpForNext(level);
  return {
    level,
    current: level >= MAX_LEVEL ? 0 : rest,
    needed: need,
    percent: level >= MAX_LEVEL ? 100 : Math.floor((rest / need) * 100),
  };
}

// ─── Rangs ──────────────────────────────────────────────────────────────────

export const RANKS = [
  { min: 1,   name: 'Bronze',       icon: '🥉', color: '#cd7f32' },
  { min: 20,  name: 'Argent',       icon: '🥈', color: '#c0c0c0' },
  { min: 40,  name: 'Or',           icon: '🥇', color: '#ffd700' },
  { min: 60,  name: 'Platine',      icon: '💠', color: '#7df9ff' },
  { min: 80,  name: 'Diamant',      icon: '💎', color: '#4fc3f7' },
  { min: 100, name: 'Maître',       icon: '🔱', color: '#b388ff' },
  { min: 125, name: 'Grand Maître', icon: '⚜️', color: '#ff8a65' },
  { min: 150, name: 'Champion',     icon: '🏆', color: '#ffab00' },
  { min: 175, name: 'Mythique',     icon: '🔮', color: '#ff4081' },
  { min: 200, name: 'Légende',      icon: '👑', color: '#ffe57f' },
];

export function rankForLevel(level) {
  let rank = RANKS[0];
  for (const r of RANKS) if (level >= r.min) rank = r;
  return rank;
}

// ─── Skins (thèmes de couleurs à débloquer) ─────────────────────────────────

export const SKINS = [
  { id: 'neon',     name: 'Néon',        level: 1,   accent: '#00ff88', accent2: '#00c8ff' },
  { id: 'crimson',  name: 'Crimson',     level: 5,   accent: '#ff3b5c', accent2: '#ff7a45' },
  { id: 'ocean',    name: 'Océan',       level: 10,  accent: '#2196f3', accent2: '#00e5ff' },
  { id: 'sunset',   name: 'Sunset',      level: 15,  accent: '#ff9100', accent2: '#ff3d6e' },
  { id: 'violet',   name: 'Violet',      level: 20,  accent: '#b388ff', accent2: '#7c4dff' },
  { id: 'sakura',   name: 'Sakura',      level: 30,  accent: '#ff80ab', accent2: '#ea80fc' },
  { id: 'gold',     name: 'Gold',        level: 40,  accent: '#ffd700', accent2: '#ffab00' },
  { id: 'glacier',  name: 'Glacier',     level: 50,  accent: '#80deea', accent2: '#b3e5fc' },
  { id: 'toxic',    name: 'Toxic',       level: 60,  accent: '#c6ff00', accent2: '#76ff03' },
  { id: 'inferno',  name: 'Inferno',     level: 75,  accent: '#ff1744', accent2: '#ff9100' },
  { id: 'galaxy',   name: 'Galaxy',      level: 90,  accent: '#7c4dff', accent2: '#00b0ff' },
  { id: 'diamant',  name: 'Diamant',     level: 100, accent: '#e0f7fa', accent2: '#4fc3f7' },
  { id: 'gmaster',  name: 'Grand Maître',level: 125, accent: '#ff8a65', accent2: '#ffd180' },
  { id: 'champion', name: 'Champion',    level: 150, accent: '#ffab00', accent2: '#ffffff' },
  { id: 'mythique', name: 'Mythique',    level: 175, accent: '#ff4081', accent2: '#b388ff' },
  { id: 'legende',  name: 'Légende',     level: 200, accent: '#ffe57f', accent2: '#ffffff' },
];

export function unlockedSkins(level) {
  return SKINS.filter(s => level >= s.level);
}

// ─── Calcul de l'XP gagnée pour une séance ──────────────────────────────────

const DIFFICULTY_MULT = { 'débutant': 1, 'intermédiaire': 1.15, 'avancé': 1.3 };

// base 40 XP + 8 par exercice validé + bonus durée, multiplié par la difficulté
// puis par le bonus de série (streak). Plafonné pour éviter le farm.
export function workoutXp({ exercisesDone, totalExercises, durationMin, difficulty, streak }) {
  const base = 40 + exercisesDone * 8;
  const durBonus = Math.min(40, Math.floor((durationMin || 0) / 5) * 4);
  const completionMult = totalExercises > 0 ? (0.5 + 0.5 * (exercisesDone / totalExercises)) : 1;
  const diffMult = DIFFICULTY_MULT[difficulty] || 1;
  const streakMult = 1 + Math.min(0.5, (streak || 0) * 0.05);
  return Math.min(300, Math.round((base + durBonus) * completionMult * diffMult * streakMult));
}
