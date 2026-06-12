// ─── Planificateur hebdo + calcul nutrition ─────────────────────────────────

// Répartit les sports sur les jours d'entraînement choisis.
// days : indices des jours (0 = lundi), mix : { sport: nbSéances }
// Retourne { jourIndex: sportId } — les jours non listés sont du repos.
export function buildWeek(days, mix) {
  const remaining = { ...mix };
  const week = {};
  let last = null;
  for (const d of [...days].sort((a, b) => a - b)) {
    const avail = Object.keys(remaining).filter(s => remaining[s] > 0);
    if (!avail.length) { week[d] = 'repos'; continue; }
    avail.sort((a, b) => remaining[b] - remaining[a]);
    let pick = avail[0];
    if (pick === last && avail.length > 1) pick = avail[1]; // évite 2 fois le même sport d'affilée si possible
    week[d] = pick;
    remaining[pick]--;
    last = pick;
  }
  return week;
}

// Calories et macros : formule de Mifflin-St Jeor + activité + objectif.
// sexe : 'h' | 'f' — objectif : 'masse' | 'maintien' | 'seche'
export function calcNutrition({ sexe, age, poids, taille, seances, objectif }) {
  const bmr = 10 * poids + 6.25 * taille - 5 * age + (sexe === 'h' ? 5 : -161);
  const tdee = bmr * (1.35 + Math.min(0.25, (seances || 0) * 0.035));
  const kcal = Math.round(tdee + (objectif === 'masse' ? 300 : objectif === 'seche' ? -400 : 0));
  const proteines = Math.round(poids * (objectif === 'seche' ? 2.2 : 1.8)); // g
  const lipides = Math.round(poids * 0.9); // g
  const glucides = Math.max(0, Math.round((kcal - proteines * 4 - lipides * 9) / 4)); // g
  return { kcal, proteines, lipides, glucides };
}
