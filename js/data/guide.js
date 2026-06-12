// ─── Guide : progressions, principes d'entraînement, nutrition ──────────────

// Chaînes d'évolution : de la version la plus facile à la plus dure.
export const PROGRESSIONS = [
  { name: 'Pompes', emoji: '🫸', steps: [
    { n: 'Pompes genoux', d: '3×10-15' },
    { n: 'Pompes', d: '3×10-20' },
    { n: 'Pompes diamant', d: '3×8-15' },
    { n: 'Pompes archer', d: '3×5-8 / côté' },
    { n: 'Pompes une main', d: '3×3-6 / côté' },
  ]},
  { name: 'Tractions', emoji: '🧗', steps: [
    { n: 'Rowing australien', d: '3×8-12' },
    { n: 'Tractions négatives (descente lente)', d: '3×5' },
    { n: 'Tractions pronation', d: '3×5-10' },
    { n: 'Tractions lestées', d: '4×5-8' },
    { n: 'Tractions archer', d: '3×4-6 / côté' },
    { n: 'Traction une main (assistée)', d: '3×1-3' },
  ]},
  { name: 'Dips', emoji: '⬇️', steps: [
    { n: 'Dips banc', d: '3×10-15' },
    { n: 'Dips barres parallèles', d: '3×6-12' },
    { n: 'Dips lestés', d: '4×5-8' },
  ]},
  { name: 'Muscle-up', emoji: '💥', steps: [
    { n: 'Tractions explosives (poitrine à la barre)', d: '5×3-5' },
    { n: 'Muscle-up négatives', d: '5×2-3' },
    { n: 'Muscle-up', d: '5×1-5' },
    { n: 'Muscle-up lesté', d: '4×2-4' },
  ]},
  { name: 'Squat sur une jambe', emoji: '🦵', steps: [
    { n: 'Squat au poids du corps', d: '3×15-20' },
    { n: 'Squat bulgare', d: '3×8-12 / jambe' },
    { n: 'Pistol squat assisté (poteau / TRX)', d: '3×5-8' },
    { n: 'Pistol squat', d: '3×5-8 / jambe' },
    { n: 'Pistol squat lesté', d: '4×4-6 / jambe' },
  ]},
  { name: 'Handstand', emoji: '🤸', steps: [
    { n: 'Poirier pieds au mur (ventre face au mur)', d: '5×20-40 s' },
    { n: 'Handstand dos au mur', d: '5×30-60 s' },
    { n: 'Handstand libre', d: '10 min de pratique' },
    { n: 'Handstand push-up au mur', d: '5×3-5' },
    { n: 'Handstand push-up libre', d: '5×2-4' },
  ]},
  { name: 'Front lever', emoji: '🏴', steps: [
    { n: 'Tuck front lever (genoux groupés)', d: '6×10-15 s' },
    { n: 'Advanced tuck (dos plat)', d: '6×8-12 s' },
    { n: 'One leg front lever', d: '6×6-10 s' },
    { n: 'Straddle front lever (jambes écartées)', d: '6×5-8 s' },
    { n: 'Full front lever', d: '6×3-8 s' },
  ]},
  { name: 'Planche (skill)', emoji: '🛩️', steps: [
    { n: 'Planche lean (épaules devant les mains)', d: '5×15-30 s' },
    { n: 'Tuck planche', d: '6×8-15 s' },
    { n: 'Advanced tuck planche', d: '6×6-10 s' },
    { n: 'Straddle planche', d: '6×4-8 s' },
    { n: 'Full planche', d: '6×3-6 s' },
  ]},
  { name: 'L-sit', emoji: '🪑', steps: [
    { n: 'Genoux repliés (tuck sit)', d: '5×10-20 s' },
    { n: 'Une jambe tendue', d: '5×8-15 s' },
    { n: 'L-sit complet', d: '5×10-20 s' },
    { n: 'V-sit', d: '5×5-10 s' },
  ]},
];

// Les règles qui font VRAIMENT prendre du muscle rapidement.
export const TRAINING_TIPS = [
  { icon: '📈', title: 'La surcharge progressive', body: 'LA règle n°1. Chaque semaine, essaie de faire un peu plus que la précédente : +1 rep, +2,5 kg, ou une progression plus dure. Si tu fais toujours la même chose, ton corps n\'a aucune raison de changer. Note tes perfs (l\'historique de l\'app sert à ça).' },
  { icon: '🎯', title: 'Les bonnes fourchettes de reps', body: 'Force : 3-6 reps lourdes, repos 3-5 min. Prise de muscle (hypertrophie) : 6-12 reps, repos 60-120 s — c\'est la zone reine pour se muscler vite. Endurance : 15+ reps. Dans tous les cas : arriver à 1-3 reps de l\'échec.' },
  { icon: '🏆', title: 'Priorité aux exercices polyarticulaires', body: 'Squat, soulevé de terre, développé couché, tractions, dips, rowing, développé militaire : ce sont eux qui construisent 80 % du physique. Les exercices d\'isolation (curls, élévations…) viennent en complément, pas à la place.' },
  { icon: '🔁', title: 'Fréquence et volume', body: 'Chaque muscle 2× par semaine minimum, avec 10 à 20 séries efficaces par muscle et par semaine. C\'est pour ça que les splits PPL, Upper/Lower et Arnold tournent sur la semaine.' },
  { icon: '😴', title: 'La récupération fait grandir le muscle', body: 'Le muscle se construit pendant le repos, pas pendant la séance. 7-9 h de sommeil, au moins 1 jour de repos complet par semaine, et 48 h avant de retravailler le même muscle.' },
  { icon: '🍗', title: 'Sans nutrition, pas de résultats', body: 'Vise 1,6 à 2,2 g de protéines par kilo de poids de corps par jour, et un léger surplus calorique (+300 kcal) pour prendre du muscle. Utilise le calculateur ci-dessous.' },
  { icon: '⏳', title: 'La régularité bat l\'intensité', body: '3 séances par semaine pendant 1 an battront toujours 6 séances par semaine pendant 2 mois. C\'est exactement le principe des niveaux : l\'XP se gagne séance après séance, pas en un week-end.' },
];

// Journées types selon l'objectif.
export const MEALS = {
  masse: { title: 'Prise de masse (surplus +300 kcal)', items: [
    { t: '🌅 Petit-déj', d: 'Flocons d\'avoine + lait + banane + beurre de cacahuète + 3 œufs' },
    { t: '🍱 Déjeuner', d: 'Riz (grosse portion) + poulet ou bœuf haché 5% + légumes + huile d\'olive' },
    { t: '🥪 Collation', d: 'Fromage blanc + miel + amandes, ou shaker protéiné + fruits' },
    { t: '🌙 Dîner', d: 'Pâtes ou pommes de terre + saumon ou œufs + légumes' },
    { t: '💡 Astuce', d: 'Si tu ne grossis pas après 2-3 semaines : ajoute 200 kcal (ex : 1 verre de lait + 1 banane)' },
  ]},
  maintien: { title: 'Maintien / recomposition', items: [
    { t: '🌅 Petit-déj', d: 'Œufs + pain complet + fruit, ou fromage blanc + flocons + fruits rouges' },
    { t: '🍱 Déjeuner', d: 'Riz ou quinoa + viande maigre ou poisson + légumes à volonté' },
    { t: '🥪 Collation', d: 'Yaourt grec ou shaker + une poignée de noix' },
    { t: '🌙 Dîner', d: 'Léger en glucides : omelette ou poisson + légumes + un peu de féculents' },
    { t: '💡 Astuce', d: 'Garde les protéines hautes à chaque repas pour construire du muscle sans grossir' },
  ]},
  seche: { title: 'Sèche (déficit -400 kcal)', items: [
    { t: '🌅 Petit-déj', d: 'Fromage blanc 0% + flocons (petite portion) + fruits rouges' },
    { t: '🍱 Déjeuner', d: 'Poulet ou poisson blanc + riz (portion modérée) + beaucoup de légumes' },
    { t: '🥪 Collation', d: 'Shaker protéiné ou yaourt grec + 1 fruit' },
    { t: '🌙 Dîner', d: 'Viande maigre ou œufs + légumes à volonté, très peu de féculents' },
    { t: '💡 Astuce', d: 'Protéines très hautes (2,2 g/kg) pour garder le muscle. Le cardio aide, le déficit fait le travail' },
  ]},
};
