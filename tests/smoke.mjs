// Test de fumée exécutable avec JavaScriptCore (jsc) — aucun navigateur requis.
//   /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc -m tests/smoke.mjs
// Simule un DOM minimal puis déroule : onboarding → dashboard → programmes →
// quêtes → guide → profil → séance complète → écran de récompense.

let failures = 0;
const check = (label, cond) => {
  print((cond ? 'PASS' : 'FAIL') + '  ' + label);
  if (!cond) failures++;
};

// ─── Stubs environnement navigateur ───
const els = new Map();
function makeEl(sel = '') {
  return {
    _sel: sel, _innerHTML: '', value: '', textContent: '', dataset: {},
    set innerHTML(v) { this._innerHTML = v; }, get innerHTML() { return this._innerHTML; },
    classList: { toggle() {}, add() {}, remove() {} },
    style: { setProperty() {} },
    addEventListener(ev, fn) { this['on' + ev] = fn; },
    setAttribute() {}, appendChild() {}, remove() {}, focus() {}, setSelectionRange() {},
  };
}
const getEl = sel => { if (!els.has(sel)) els.set(sel, makeEl(sel)); return els.get(sel); };

globalThis.document = {
  querySelector: getEl,
  querySelectorAll: () => [],
  documentElement: makeEl(),
  createElement: () => makeEl(),
};
globalThis.window = globalThis;
globalThis.scrollTo = () => {};
globalThis.setTimeout = () => 0;
globalThis.confirm = () => true;
const storage = new Map();
globalThis.localStorage = {
  getItem: k => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, v),
  removeItem: k => storage.delete(k),
};
if (!globalThis.structuredClone) globalThis.structuredClone = x => JSON.parse(JSON.stringify(x));

// ─── Tests du moteur d'XP ───
const xp = await import('../js/xp.js');
check('XP total niveau 200 > 250 000 (progression longue)', xp.totalXpForLevel(200) > 250000);
check('0 XP = niveau 1', xp.levelFromXp(0).level === 1);
check('300 000 XP = niveau 200 max', xp.levelFromXp(300000).level === 200);
const gain = xp.workoutXp({ exercisesDone: 6, totalExercises: 6, durationMin: 60, difficulty: 'intermédiaire', streak: 3 });
check('XP séance complète cohérente (100-300)', gain >= 100 && gain <= 300);
check('rang niveau 87 = Diamant', xp.rankForLevel(87).name === 'Diamant');
check('16 skins, 6 débloqués au niveau 30', xp.SKINS.length === 16 && xp.unlockedSkins(30).length === 6);

// ─── Données ───
const progs = await import('../js/data/programs.js');
const exos = await import('../js/data/exercises.js');
check('30 programmes préconçus', progs.PROGRAMS.length === 30);
check('13 programmes street workout', progs.PROGRAMS.filter(p => p.sport === 'street').length === 13);
check('programme Road to (upper body, sur-mesure)', !!progs.PROGRAMS.find(p => p.id === 'road-haut' && p.daysPerWeek === 4));
check('6 programmes HYROX', progs.PROGRAMS.filter(p => p.sport === 'hyrox').length === 6);
check('HYROX couvre sans salle + par temps cible', (() => {
  const h = progs.PROGRAMS.filter(p => p.sport === 'hyrox');
  const sansSalle = h.filter(p => /sans salle/i.test(p.name)).length;
  const temps = h.filter(p => /sub|1h|2h/i.test(p.name.toLowerCase())).length;
  return sansSalle >= 2 && temps >= 3;
})());
check('4 sports couverts (salle, course, street, hyrox)', new Set(progs.PROGRAMS.map(p => p.sport)).size === 4);
check('chaque séance HYROX a du contenu', progs.PROGRAMS.filter(p => p.sport === 'hyrox').every(p => p.days.every(d => d.items.length >= 3 && d.items.every(it => it.n && it.d))));
check('chaque programme a des séances remplies', progs.PROGRAMS.every(p => p.days.length > 0 && p.days.every(d => d.items.length > 0)));
check('séances street complètes (≥4 exos, multi-muscles)', progs.PROGRAMS.filter(p => p.sport === 'street').every(p => p.days.every(d => d.items.length >= 4)));
check('ids de programmes uniques', new Set(progs.PROGRAMS.map(p => p.id)).size === progs.PROGRAMS.length);
check('200+ exercices en bibliothèque', exos.EXERCISES.length >= 200);
check('chaque exercice a niveau + reps conseillées', exos.EXERCISES.every(e => [1, 2, 3].includes(e.lvl) && e.reps && e.cat && e.sport));
check('pas de doublons de noms d\'exercices', new Set(exos.EXERCISES.map(e => e.name)).size === exos.EXERCISES.length);

// ─── Planificateur hebdo + nutrition ───
const { buildWeek, calcNutrition } = await import('../js/planner.js');
const week = buildWeek([0, 1, 2, 3, 4, 5], { street: 4, course: 2 });
const counts = Object.values(week).reduce((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {});
check('semaine 4 street + 2 course bien répartie', counts.street === 4 && counts.course === 2);
check('jour non coché = pas dans le planning', week[6] === undefined);
const macros = calcNutrition({ sexe: 'h', age: 20, poids: 70, taille: 178, seances: 6, objectif: 'masse' });
check('calories prise de masse plausibles (2600-3600)', macros.kcal >= 2600 && macros.kcal <= 3600);
check('protéines = 1,8 g/kg en masse', macros.proteines === 126);
const guide = await import('../js/data/guide.js');
check('9 progressions d\'exercices', guide.PROGRESSIONS.length === 9);
check('7 principes + 3 plans de repas', guide.TRAINING_TIPS.length === 7 && Object.keys(guide.MEALS).length === 3);
check('roadmap 4 phases, 1 seul "tu es ici", objectif 18 tractions', guide.ROADMAP.length === 4 && guide.ROADMAP.filter(p => p.here).length === 1 && JSON.stringify(guide.ROADMAP).includes('18'));

// ─── Parcours complet de l'app ───
const { state } = await import('../js/store.js');
await import('../js/app.js');

const appEl = getEl('#app');
check('onboarding affiché au premier lancement', appEl.innerHTML.includes('FitQuest') && appEl.innerHTML.includes('pseudo'));

// Création du profil (comme le ferait l'écran d'onboarding) — entraînement tous les jours en salle
state.profile = {
  name: 'Testeur', sports: ['salle', 'street'], days: [0, 1, 2, 3, 4, 5, 6],
  weeklyMix: { salle: 7 }, createdAt: new Date().toISOString(),
};
state.activePrograms = { salle: 'ppl' };

const navClick = route => getEl('#navbar').onclick({ target: { closest: () => ({ dataset: { route } }) } });
navClick('dashboard');
check('dashboard : header joueur niveau 1', appEl.innerHTML.includes('NIVEAU') && appEl.innerHTML.includes('Testeur'));
check('dashboard : planning hebdo affiché', appEl.innerHTML.includes('Lun') && appEl.innerHTML.includes('Dim'));
check('dashboard : séance du jour PPL proposée', appEl.innerHTML.includes('Push'));

navClick('programs');
check('page programmes : les 14 cartes sont là', appEl.innerHTML.includes('Arnold Split') && appEl.innerHTML.includes('Couch to 5K') && appEl.innerHTML.includes('Skills Calisthénie'));

navClick('quests');
check('page quêtes affichée', appEl.innerHTML.includes('Quêtes') && appEl.innerHTML.includes('séances cette semaine'));

navClick('guide');
check('guide : roadmap "tu es ici" + objectif 18', appEl.innerHTML.includes('TU ES ICI') && appEl.innerHTML.includes('18 TRACTIONS'));
check('guide : principes muscu', appEl.innerHTML.includes('surcharge progressive') && appEl.innerHTML.includes('fourchettes de reps'));
check('guide : progressions affichées', appEl.innerHTML.includes('Muscle-up') && appEl.innerHTML.includes('ÉTAPE'));
check('guide : formulaire nutrition', appEl.innerHTML.includes('Poids') && appEl.innerHTML.includes('Objectif'));

// Calcul nutrition via le formulaire
getEl('#nu-sexe').value = 'h'; getEl('#nu-age').value = '20';
getEl('#nu-poids').value = '70'; getEl('#nu-taille').value = '178';
getEl('#nu-obj').value = 'masse';
getEl('#nu-calc').onclick();
check('nutrition calculée et affichée', state.nutrition?.poids === 70 && appEl.innerHTML.includes('kcal') && appEl.innerHTML.includes('Journée type'));

navClick('profile');
check('profil : grille de skins avec verrous', appEl.innerHTML.includes('Skins') && appEl.innerHTML.includes('🔒'));
check('profil : planning résumé + bouton modifier', appEl.innerHTML.includes('Mon planning') && appEl.innerHTML.includes('Modifier'));

navClick('plan');
check('éditeur de planning affiché', appEl.innerHTML.includes('Répartition des séances'));

// Séance complète : on coche tout puis on termine
state.session = { programId: 'ppl', dayIndex: 0, checked: [0, 1, 2, 3, 4, 5], startedAt: Date.now() - 45 * 60000 };
navClick('session');
check('écran séance : exercices listés', appEl.innerHTML.includes('Développé couché') && appEl.innerHTML.includes('6/6'));

const xpBefore = state.xp;
getEl('#finish').onclick();
check('séance terminée : XP gagnée', state.xp > xpBefore);
check('écran récompense affiché', appEl.innerHTML.includes('XP') && appEl.innerHTML.includes('SÉANCE TERMINÉE'));
check('historique mis à jour', state.history.length === 1);
check('streak démarrée', state.streak.count === 1);
check('rotation : prochaine séance = Pull', state.dayProgress.ppl === 1);

getEl('#continue').onclick();
check('retour au dashboard après récompense', appEl.innerHTML.includes('Dernières séances'));

print(failures === 0 ? '\n✅ TOUS LES TESTS PASSENT' : `\n❌ ${failures} test(s) en échec`);
if (failures > 0) throw new Error(failures + ' échecs');
