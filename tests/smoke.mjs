// Test de fumée exécutable avec JavaScriptCore (jsc) — aucun navigateur requis.
//   /System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc -m tests/smoke.mjs
// Simule un DOM minimal puis déroule : onboarding → dashboard → programmes →
// quêtes → profil → séance complète → écran de récompense.

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

const progs = await import('../js/data/programs.js');
const exos = await import('../js/data/exercises.js');
check('14 programmes préconçus', progs.PROGRAMS.length === 14);
check('3 sports couverts', new Set(progs.PROGRAMS.map(p => p.sport)).size === 3);
check('chaque programme a des séances remplies', progs.PROGRAMS.every(p => p.days.length > 0 && p.days.every(d => d.items.length > 0)));
check('70+ exercices en bibliothèque', exos.EXERCISES.length >= 70);

// ─── Parcours complet de l'app ───
const { state } = await import('../js/store.js');
await import('../js/app.js');

const appEl = getEl('#app');
check('onboarding affiché au premier lancement', appEl.innerHTML.includes('FitQuest') && appEl.innerHTML.includes('pseudo'));

// Création du profil (comme le ferait l'écran d'onboarding)
state.profile = { name: 'Testeur', sports: ['salle', 'street'], days: [0, 2, 4], createdAt: new Date().toISOString() };
state.activeProgramId = 'ppl';

const navClick = route => getEl('#navbar').onclick({ target: { closest: () => ({ dataset: { route } }) } });
navClick('dashboard');
check('dashboard : header joueur niveau 1', appEl.innerHTML.includes('NIVEAU') && appEl.innerHTML.includes('Testeur'));
check('dashboard : séance du jour PPL proposée', appEl.innerHTML.includes('Push'));

navClick('programs');
check('page programmes : les 14 cartes sont là', appEl.innerHTML.includes('Arnold Split') && appEl.innerHTML.includes('Couch to 5K') && appEl.innerHTML.includes('Skills Calisthénie'));

navClick('quests');
check('page quêtes affichée', appEl.innerHTML.includes('Quêtes') && appEl.innerHTML.includes('séances cette semaine'));

navClick('profile');
check('profil : grille de skins avec verrous', appEl.innerHTML.includes('Skins') && appEl.innerHTML.includes('🔒'));

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
