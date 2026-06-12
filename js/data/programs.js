// ─── Programmes préconçus ───────────────────────────────────────────────────
// Inspirés des programmes les plus reconnus : PPL, Upper/Lower, Arnold Split,
// StrongLifts 5x5, PHUL, Couch to 5K, plans 10K/semi, Reddit Recommended Routine…
// sport : salle | course | street — difficulty : débutant | intermédiaire | avancé

export const PROGRAMS = [
  // ════════════════ SALLE ════════════════
  {
    id: 'fullbody-deb', sport: 'salle', difficulty: 'débutant', daysPerWeek: 3,
    name: 'Full Body Débutant', emoji: '🏋️',
    goal: 'Construire une base solide sur tout le corps, 3 séances par semaine.',
    days: [
      { name: 'Full Body A', items: [
        { n: 'Squat barre', d: '3×8-10' },
        { n: 'Développé couché barre', d: '3×8-10' },
        { n: 'Tirage vertical poulie', d: '3×10-12' },
        { n: 'Développé épaules haltères', d: '3×10-12' },
        { n: 'Planche', d: '3×30-45 s' },
      ]},
      { name: 'Full Body B', items: [
        { n: 'Presse à cuisses', d: '3×10-12' },
        { n: 'Rowing barre', d: '3×8-10' },
        { n: 'Développé incliné', d: '3×8-10' },
        { n: 'Curl haltères', d: '3×10-12' },
        { n: 'Crunch câble', d: '3×12-15' },
      ]},
      { name: 'Full Body C', items: [
        { n: 'Soulevé de terre roumain', d: '3×8-10' },
        { n: 'Tractions assistées ou tirage', d: '3×8-10' },
        { n: 'Développé couché haltères', d: '3×10-12' },
        { n: 'Élévations latérales', d: '3×12-15' },
        { n: 'Relevés de jambes suspendu', d: '3×10-12' },
      ]},
    ],
  },
  {
    id: 'stronglifts', sport: 'salle', difficulty: 'débutant', daysPerWeek: 3,
    name: 'StrongLifts 5×5', emoji: '🔩',
    goal: 'Le classique force : 5 séries de 5 sur les mouvements de base, charge qui monte chaque séance.',
    days: [
      { name: 'Séance A', items: [
        { n: 'Squat barre', d: '5×5' },
        { n: 'Développé couché barre', d: '5×5' },
        { n: 'Rowing barre', d: '5×5' },
      ]},
      { name: 'Séance B', items: [
        { n: 'Squat barre', d: '5×5' },
        { n: 'Développé militaire barre', d: '5×5' },
        { n: 'Soulevé de terre', d: '1×5' },
      ]},
    ],
  },
  {
    id: 'upper-lower', sport: 'salle', difficulty: 'intermédiaire', daysPerWeek: 4,
    name: 'Upper / Lower', emoji: '⚡',
    goal: 'Haut / bas du corps en alternance, 4 séances : le meilleur ratio volume-récupération.',
    days: [
      { name: 'Upper 1 (force)', items: [
        { n: 'Développé couché barre', d: '4×5-6' },
        { n: 'Rowing barre', d: '4×5-6' },
        { n: 'Développé militaire barre', d: '3×6-8' },
        { n: 'Tractions pronation', d: '3×6-8' },
        { n: 'Curl barre', d: '3×8-10' },
        { n: 'Barre au front', d: '3×8-10' },
      ]},
      { name: 'Lower 1 (force)', items: [
        { n: 'Squat barre', d: '4×5-6' },
        { n: 'Soulevé de terre roumain', d: '3×6-8' },
        { n: 'Presse à cuisses', d: '3×8-10' },
        { n: 'Mollets debout', d: '4×10-12' },
        { n: 'Crunch câble', d: '3×12-15' },
      ]},
      { name: 'Upper 2 (volume)', items: [
        { n: 'Développé incliné', d: '3×8-12' },
        { n: 'Tirage horizontal poulie', d: '3×8-12' },
        { n: 'Élévations latérales', d: '4×12-15' },
        { n: 'Face pull', d: '3×12-15' },
        { n: 'Curl marteau', d: '3×10-12' },
        { n: 'Extension triceps poulie', d: '3×10-12' },
      ]},
      { name: 'Lower 2 (volume)', items: [
        { n: 'Fentes haltères', d: '3×10-12' },
        { n: 'Hip thrust', d: '3×8-12' },
        { n: 'Leg curl', d: '3×10-12' },
        { n: 'Leg extension', d: '3×12-15' },
        { n: 'Relevés de jambes suspendu', d: '3×10-15' },
      ]},
    ],
  },
  {
    id: 'ppl', sport: 'salle', difficulty: 'intermédiaire', daysPerWeek: 6,
    name: 'Push Pull Legs (PPL)', emoji: '🔥',
    goal: 'LE split le plus populaire au monde : pousser, tirer, jambes — 6 jours pour un volume maximal.',
    days: [
      { name: 'Push (pecs, épaules, triceps)', items: [
        { n: 'Développé couché barre', d: '4×6-8' },
        { n: 'Développé incliné', d: '3×8-10' },
        { n: 'Développé épaules haltères', d: '3×8-10' },
        { n: 'Élévations latérales', d: '4×12-15' },
        { n: 'Extension triceps poulie', d: '3×10-12' },
        { n: 'Écartés câbles / poulie', d: '3×12-15' },
      ]},
      { name: 'Pull (dos, biceps)', items: [
        { n: 'Tractions pronation', d: '4×6-10' },
        { n: 'Rowing barre', d: '4×8-10' },
        { n: 'Tirage horizontal poulie', d: '3×10-12' },
        { n: 'Face pull', d: '3×12-15' },
        { n: 'Curl barre', d: '3×8-10' },
        { n: 'Curl marteau', d: '3×10-12' },
      ]},
      { name: 'Legs (jambes, abdos)', items: [
        { n: 'Squat barre', d: '4×6-8' },
        { n: 'Soulevé de terre roumain', d: '3×8-10' },
        { n: 'Presse à cuisses', d: '3×10-12' },
        { n: 'Leg curl', d: '3×10-12' },
        { n: 'Mollets debout', d: '4×12-15' },
        { n: 'Relevés de jambes suspendu', d: '3×10-15' },
      ]},
    ],
  },
  {
    id: 'phul', sport: 'salle', difficulty: 'intermédiaire', daysPerWeek: 4,
    name: 'PHUL (Power Hypertrophy)', emoji: '🧱',
    goal: 'Moitié force, moitié hypertrophie : devenir fort ET esthétique en 4 séances.',
    days: [
      { name: 'Upper Power', items: [
        { n: 'Développé couché barre', d: '4×3-5' },
        { n: 'Rowing barre', d: '4×3-5' },
        { n: 'Développé militaire barre', d: '3×5-8' },
        { n: 'Tractions lestées', d: '3×5-8' },
        { n: 'Curl barre', d: '3×6-10' },
      ]},
      { name: 'Lower Power', items: [
        { n: 'Squat barre', d: '4×3-5' },
        { n: 'Soulevé de terre', d: '3×3-5' },
        { n: 'Presse à cuisses', d: '3×8-10' },
        { n: 'Mollets debout', d: '4×6-10' },
      ]},
      { name: 'Upper Hypertrophie', items: [
        { n: 'Développé incliné', d: '4×8-12' },
        { n: 'Tirage vertical poulie', d: '4×8-12' },
        { n: 'Écartés câbles / poulie', d: '3×12-15' },
        { n: 'Élévations latérales', d: '3×12-15' },
        { n: 'Curl haltères', d: '3×10-12' },
        { n: 'Extension triceps poulie', d: '3×10-12' },
      ]},
      { name: 'Lower Hypertrophie', items: [
        { n: 'Fentes haltères', d: '3×10-12' },
        { n: 'Hip thrust', d: '3×10-12' },
        { n: 'Leg extension', d: '3×12-15' },
        { n: 'Leg curl', d: '3×12-15' },
        { n: 'Crunch câble', d: '3×12-15' },
      ]},
    ],
  },
  {
    id: 'arnold', sport: 'salle', difficulty: 'avancé', daysPerWeek: 6,
    name: 'Arnold Split', emoji: '👑',
    goal: 'Le split légendaire d\'Arnold Schwarzenegger : pecs/dos, épaules/bras, jambes — ×2 par semaine.',
    days: [
      { name: 'Pecs / Dos', items: [
        { n: 'Développé couché barre', d: '4×8-10' },
        { n: 'Développé incliné', d: '3×8-10' },
        { n: 'Écartés câbles / poulie', d: '3×12' },
        { n: 'Tractions pronation', d: '4×max' },
        { n: 'Rowing barre', d: '4×8-10' },
        { n: 'Tirage horizontal poulie', d: '3×10-12' },
      ]},
      { name: 'Épaules / Bras', items: [
        { n: 'Développé épaules haltères', d: '4×8-10' },
        { n: 'Élévations latérales', d: '4×12-15' },
        { n: 'Oiseau / élévations arrière', d: '3×12-15' },
        { n: 'Curl barre', d: '4×8-10' },
        { n: 'Curl marteau', d: '3×10-12' },
        { n: 'Barre au front', d: '4×8-10' },
        { n: 'Extension triceps poulie', d: '3×10-12' },
      ]},
      { name: 'Jambes / Abdos', items: [
        { n: 'Squat barre', d: '4×8-10' },
        { n: 'Presse à cuisses', d: '3×10-12' },
        { n: 'Fentes haltères', d: '3×10-12' },
        { n: 'Leg curl', d: '3×10-12' },
        { n: 'Mollets debout', d: '4×12-15' },
        { n: 'Crunch', d: '4×15-20' },
      ]},
    ],
  },
  {
    id: 'aesthetic', sport: 'salle', difficulty: 'avancé', daysPerWeek: 5,
    name: 'Aesthetic V-Taper', emoji: '🗿',
    goal: 'Le physique le plus esthétique possible : épaules larges, dos en V, taille fine, abdos.',
    days: [
      { name: 'Épaules (priorité)', items: [
        { n: 'Développé militaire barre', d: '4×6-8' },
        { n: 'Élévations latérales', d: '5×12-15' },
        { n: 'Oiseau / élévations arrière', d: '4×12-15' },
        { n: 'Face pull', d: '3×15' },
        { n: 'Élévations latérales (drop set)', d: '2×max' },
      ]},
      { name: 'Dos largeur', items: [
        { n: 'Tractions pronation', d: '4×8-12' },
        { n: 'Tirage vertical poulie', d: '4×10-12' },
        { n: 'Rowing haltère unilatéral', d: '3×10-12' },
        { n: 'Tirage horizontal poulie', d: '3×10-12' },
        { n: 'Relevés de jambes suspendu', d: '4×12-15' },
      ]},
      { name: 'Pecs', items: [
        { n: 'Développé incliné', d: '4×8-10' },
        { n: 'Développé couché haltères', d: '3×8-12' },
        { n: 'Écartés câbles / poulie', d: '4×12-15' },
        { n: 'Pompes lestées', d: '3×max' },
      ]},
      { name: 'Bras + Abdos', items: [
        { n: 'Curl barre', d: '4×8-10' },
        { n: 'Curl marteau', d: '3×10-12' },
        { n: 'Barre au front', d: '4×8-10' },
        { n: 'Extension triceps poulie', d: '3×12' },
        { n: 'Crunch câble', d: '4×12-15' },
        { n: 'Planche', d: '3×60 s' },
      ]},
      { name: 'Jambes', items: [
        { n: 'Squat barre', d: '4×6-8' },
        { n: 'Soulevé de terre roumain', d: '3×8-10' },
        { n: 'Leg extension', d: '3×12-15' },
        { n: 'Leg curl', d: '3×12-15' },
        { n: 'Mollets debout', d: '5×12-15' },
      ]},
    ],
  },

  // ════════════════ COURSE ════════════════
  {
    id: 'c25k', sport: 'course', difficulty: 'débutant', daysPerWeek: 3,
    name: 'Objectif 5 km (Couch to 5K)', emoji: '🏃',
    goal: 'De zéro à 5 km en courant : alternance marche/course qui évolue sur 8 semaines.',
    days: [
      { name: 'Séance alternée', items: [
        { n: 'Échauffement marche rapide', d: '5 min' },
        { n: 'Alternance course / marche', d: '8× (1 min course + 90 s marche)' },
        { n: 'Retour au calme', d: '5 min marche' },
      ]},
      { name: 'Séance progression', items: [
        { n: 'Échauffement marche rapide', d: '5 min' },
        { n: 'Alternance course / marche', d: '6× (2 min course + 1 min marche)' },
        { n: 'Retour au calme', d: '5 min marche' },
      ]},
      { name: 'Séance continue', items: [
        { n: 'Échauffement marche rapide', d: '5 min' },
        { n: 'Footing allure facile', d: '15-25 min sans marcher (augmente chaque semaine)' },
        { n: 'Retour au calme', d: '5 min marche' },
      ]},
    ],
  },
  {
    id: 'obj10k', sport: 'course', difficulty: 'intermédiaire', daysPerWeek: 4,
    name: 'Objectif 10 km', emoji: '🎯',
    goal: 'Courir 10 km et améliorer ton chrono : endurance, seuil et fractionné.',
    days: [
      { name: 'Footing fondamental', items: [
        { n: 'Footing allure facile', d: '40-45 min, aisance respiratoire' },
      ]},
      { name: 'Fractionné VMA', items: [
        { n: 'Échauffement', d: '15 min footing' },
        { n: 'Fractionné court (30/30)', d: '2 blocs de 8× (30 s vite / 30 s lent)' },
        { n: 'Retour au calme', d: '10 min footing lent' },
      ]},
      { name: 'Séance seuil', items: [
        { n: 'Échauffement', d: '15 min footing' },
        { n: 'Allure seuil / tempo', d: '2×10 min allure soutenue, récup 3 min' },
        { n: 'Retour au calme', d: '10 min footing lent' },
      ]},
      { name: 'Sortie longue', items: [
        { n: 'Sortie longue', d: '1 h - 1 h 15 allure facile' },
      ]},
    ],
  },
  {
    id: 'semi', sport: 'course', difficulty: 'avancé', daysPerWeek: 5,
    name: 'Semi-marathon', emoji: '🏅',
    goal: 'Préparer 21,1 km : volume, allure spécifique et sorties longues.',
    days: [
      { name: 'Footing récupération', items: [
        { n: 'Footing allure facile', d: '40 min très facile' },
      ]},
      { name: 'VMA longue', items: [
        { n: 'Échauffement', d: '20 min footing' },
        { n: 'Fractionné long (400-1000 m)', d: '5×1000 m allure 10 km, récup 2 min' },
        { n: 'Retour au calme', d: '10 min footing lent' },
      ]},
      { name: 'Footing + côtes', items: [
        { n: 'Footing allure facile', d: '40 min' },
        { n: 'Côtes', d: '8×20 s en côte, récup descente' },
      ]},
      { name: 'Allure spécifique semi', items: [
        { n: 'Échauffement', d: '15 min footing' },
        { n: 'Allure seuil / tempo', d: '3×15 min allure semi, récup 3 min' },
      ]},
      { name: 'Sortie longue', items: [
        { n: 'Sortie longue', d: '1 h 30 - 1 h 50, dont 20 min allure semi en fin' },
      ]},
    ],
  },
  {
    id: 'vma', sport: 'course', difficulty: 'intermédiaire', daysPerWeek: 3,
    name: 'Spécial vitesse / VMA', emoji: '⚡',
    goal: 'Devenir plus rapide : fractionné, sprints et côtes, 3 séances par semaine.',
    days: [
      { name: 'Fractionné court', items: [
        { n: 'Échauffement', d: '15 min footing + gammes' },
        { n: 'Fractionné court (30/30)', d: '2×10 (30 s VMA / 30 s lent)' },
        { n: 'Retour au calme', d: '10 min' },
      ]},
      { name: 'Sprints + côtes', items: [
        { n: 'Échauffement', d: '15 min footing' },
        { n: 'Sprint', d: '6×80 m récup marche retour' },
        { n: 'Côtes', d: '6×15 s récup descente' },
      ]},
      { name: 'Footing endurance', items: [
        { n: 'Footing allure facile', d: '45 min' },
      ]},
    ],
  },

  // ════════════════ STREET WORKOUT ════════════════
  {
    id: 'rr', sport: 'street', difficulty: 'débutant', daysPerWeek: 3,
    name: 'Recommended Routine (bases)', emoji: '🤸',
    goal: 'La référence mondiale du poids du corps (r/bodyweightfitness) : tirer, pousser, jambes.',
    days: [
      { name: 'Full Body poids du corps', items: [
        { n: 'Tractions pronation (ou rowing australien)', d: '3×5-8' },
        { n: 'Dips (ou pompes)', d: '3×5-8' },
        { n: 'Squat au poids du corps', d: '3×15-20' },
        { n: 'Rowing australien', d: '3×8-12' },
        { n: 'Pompes', d: '3×8-12' },
        { n: 'Planche', d: '3×30-60 s' },
      ]},
    ],
  },
  {
    id: 'street-inter', sport: 'street', difficulty: 'intermédiaire', daysPerWeek: 4,
    name: 'Street Power (lesté)', emoji: '⛓️',
    goal: 'Tractions et dips lestés pour la force, volume au poids du corps pour le physique.',
    days: [
      { name: 'Tirage (dos, biceps)', items: [
        { n: 'Tractions lestées', d: '5×5' },
        { n: 'Tractions pronation', d: '3×max' },
        { n: 'Rowing australien', d: '3×10-12' },
        { n: 'Chin-up serré', d: '3×8-10' },
        { n: 'Relevés de jambes suspendu', d: '3×10-15' },
      ]},
      { name: 'Poussée (pecs, épaules, triceps)', items: [
        { n: 'Dips lestés', d: '5×5' },
        { n: 'Pompes lestées', d: '3×8-10' },
        { n: 'Pike push-up', d: '3×8-10' },
        { n: 'Pompes diamant', d: '3×max' },
        { n: 'Planche', d: '3×45-60 s' },
      ]},
      { name: 'Jambes', items: [
        { n: 'Pistol squat (progressions)', d: '4×5-8 / jambe' },
        { n: 'Squat bulgare', d: '3×8-10' },
        { n: 'Fentes sautées', d: '3×20' },
        { n: 'Corde à sauter', d: '10 min' },
      ]},
      { name: 'Volume + cardio', items: [
        { n: 'Tractions pronation', d: '5×max (repos 90 s)' },
        { n: 'Dips', d: '5×max (repos 90 s)' },
        { n: 'Pompes', d: '100 reps au total' },
        { n: 'Burpees', d: '3×15' },
      ]},
    ],
  },
  {
    id: 'skills', sport: 'street', difficulty: 'avancé', daysPerWeek: 5,
    name: 'Skills Calisthénie', emoji: '🥷',
    goal: 'Débloquer les figures : muscle-up, front lever, handstand, planche.',
    days: [
      { name: 'Muscle-up', items: [
        { n: 'Tractions explosives poitrine', d: '5×3-5' },
        { n: 'Muscle-up (négatives ou assisté)', d: '5×3' },
        { n: 'Dips lestés', d: '4×5' },
        { n: 'Transition au sol (simulation)', d: '3×8' },
      ]},
      { name: 'Front lever', items: [
        { n: 'Front lever (progressions)', d: '6×8-12 s de hold' },
        { n: 'Tractions lestées', d: '4×5' },
        { n: 'Relevés de jambes suspendu', d: '4×10' },
        { n: 'Hollow body hold', d: '4×30 s' },
      ]},
      { name: 'Handstand', items: [
        { n: 'Handstand (équilibre)', d: '15 min de pratique' },
        { n: 'Handstand push-up (progressions)', d: '5×3-5' },
        { n: 'Pike push-up', d: '3×8-10' },
        { n: 'L-sit', d: '5×10-15 s' },
      ]},
      { name: 'Planche', items: [
        { n: 'Planche (progressions)', d: '6×8-12 s de hold' },
        { n: 'Pompes lestées', d: '4×6-8' },
        { n: 'Pseudo planche push-up', d: '4×6-8' },
        { n: 'Hollow body hold', d: '4×30 s' },
      ]},
      { name: 'Force générale', items: [
        { n: 'Tractions lestées', d: '5×5' },
        { n: 'Dips lestés', d: '5×5' },
        { n: 'Pistol squat', d: '4×6 / jambe' },
        { n: 'Human flag (progressions)', d: '5 tentatives / côté' },
      ]},
    ],
  },
];

export const SPORTS = [
  { id: 'salle', name: 'Salle de muscu', emoji: '🏋️' },
  { id: 'course', name: 'Course à pied', emoji: '🏃' },
  { id: 'street', name: 'Street workout', emoji: '🤸' },
];
