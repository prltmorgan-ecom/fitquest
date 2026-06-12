// ─── FitQuest — app principale ──────────────────────────────────────────────
import { state, save, resetAll, playerLevel, bumpStreak, streakAlive } from './store.js';
import { MAX_LEVEL, levelFromXp, rankForLevel, SKINS, unlockedSkins, workoutXp, xpForNext, totalXpForLevel } from './xp.js';
import { PROGRAMS, SPORTS } from './data/programs.js';
import { EXERCISES, CATEGORIES } from './data/exercises.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DIFF_TAG = { 'débutant': 'deb', 'intermédiaire': 'int', 'avancé': 'adv' };

// ─── Skins ───
function applySkin() {
  const skin = SKINS.find(s => s.id === state.skin) || SKINS[0];
  document.documentElement.style.setProperty('--accent', skin.accent);
  document.documentElement.style.setProperty('--accent2', skin.accent2);
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', '#0b0e14');
}

// ─── Toasts ───
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  $('#toast-zone').appendChild(el);
  setTimeout(() => el.remove(), 3100);
}

// ─── Programmes (préconçus + persos) ───
function allPrograms() { return [...PROGRAMS, ...state.customPrograms]; }
function findProgram(id) { return allPrograms().find(p => p.id === id); }

function nextDayIndex(prog) {
  state.dayProgress = state.dayProgress || {};
  return (state.dayProgress[prog.id] || 0) % prog.days.length;
}

// ─── Router ───
let route = { name: 'dashboard', params: {} };

function nav(name, params = {}) {
  route = { name, params };
  render();
  window.scrollTo(0, 0);
}

function render() {
  applySkin();
  const hasProfile = !!state.profile;
  $('#navbar').classList.toggle('hidden', !hasProfile || route.name === 'session' || route.name === 'reward');
  $$('.nav-btn').forEach(b => b.classList.toggle('on', b.dataset.route === route.name));

  if (!hasProfile) return renderOnboarding();
  const views = {
    dashboard: renderDashboard, programs: renderPrograms, program: renderProgramDetail,
    builder: renderBuilder, session: renderSession, reward: renderReward,
    quests: renderQuests, profile: renderProfile,
  };
  (views[route.name] || renderDashboard)();
}

// ═══════════════ ONBOARDING ═══════════════
const draft = { sports: [], days: [] };

function renderOnboarding() {
  app.innerHTML = `
    <div class="center" style="padding:30px 0 10px">
      <div style="font-size:54px">⚔️</div>
      <h1>FitQuest</h1>
      <p class="muted">Ton entraînement devient un jeu vidéo.<br>Niveau 1 → ${MAX_LEVEL}. Tout le monde commence en bas.</p>
    </div>
    <div class="card">
      <label class="field">Ton pseudo
        <input type="text" id="ob-name" maxlength="20" placeholder="Ex : Morgan" value="${esc(draft.name || '')}">
      </label>
      <label class="field">Tes sports (plusieurs possibles)
        <div class="chips" id="ob-sports">
          ${SPORTS.map(s => `<button class="chip ${draft.sports.includes(s.id) ? 'on' : ''}" data-id="${s.id}">${s.emoji} ${s.name}</button>`).join('')}
        </div>
      </label>
      <label class="field">Tes jours d'entraînement
        <div class="chips" id="ob-days">
          ${WEEKDAYS.map((d, i) => `<button class="chip ${draft.days.includes(i) ? 'on' : ''}" data-i="${i}">${d}</button>`).join('')}
        </div>
      </label>
      <button class="btn mt" id="ob-go">Commencer l'aventure — Niveau 1 🎮</button>
    </div>
    <p class="muted center">Chaque séance terminée te donne de l'XP.<br>Monte de niveau, débloque des skins, deviens une Légende.</p>`;

  $('#ob-sports').onclick = e => {
    const id = e.target.closest('.chip')?.dataset.id;
    if (!id) return;
    draft.sports.includes(id) ? draft.sports.splice(draft.sports.indexOf(id), 1) : draft.sports.push(id);
    render();
  };
  $('#ob-days').onclick = e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const i = +btn.dataset.i;
    draft.days.includes(i) ? draft.days.splice(draft.days.indexOf(i), 1) : draft.days.push(i);
    draft.name = $('#ob-name').value;
    render();
  };
  $('#ob-go').onclick = () => {
    const name = $('#ob-name').value.trim();
    if (!name) return toast('⚠️ Choisis un pseudo !');
    if (!draft.sports.length) return toast('⚠️ Choisis au moins un sport !');
    if (!draft.days.length) return toast('⚠️ Choisis tes jours d\'entraînement !');
    state.profile = { name, sports: [...draft.sports], days: [...draft.days].sort(), createdAt: new Date().toISOString() };
    save();
    toast(`🎮 Bienvenue ${name} — Niveau 1 !`);
    nav('programs');
  };
}

// ═══════════════ HEADER JOUEUR ═══════════════
function playerHeader() {
  const lv = playerLevel();
  const rank = rankForLevel(lv.level);
  const streak = streakAlive() ? state.streak.count : 0;
  return `
    <div class="card glow">
      <div class="row">
        <div class="level-badge"><span class="lvl">${lv.level}</span><span class="lbl">NIVEAU</span></div>
        <div style="flex:1">
          <div class="row between">
            <h3>${esc(state.profile.name)}</h3>
            <span class="rank-pill" style="color:${rank.color}">${rank.icon} ${rank.name}</span>
          </div>
          <div class="xpbar"><div style="width:${lv.percent}%"></div></div>
          <p class="muted" style="margin-top:5px;font-size:12px">
            ${lv.level >= MAX_LEVEL ? '👑 NIVEAU MAX ATTEINT' : `${lv.current} / ${lv.needed} XP — niveau ${lv.level + 1} à ${lv.needed - lv.current} XP`}
            ${streak > 0 ? ` &nbsp;🔥 ${streak} j` : ''}
          </p>
        </div>
      </div>
    </div>`;
}

// ═══════════════ DASHBOARD ═══════════════
function renderDashboard() {
  const active = state.activeProgramId ? findProgram(state.activeProgramId) : null;
  const today = (new Date().getDay() + 6) % 7; // 0 = lundi
  const isTrainingDay = state.profile.days.includes(today);
  const day = active ? active.days[nextDayIndex(active)] : null;
  const recent = [...state.history].slice(-5).reverse();

  app.innerHTML = `
    ${playerHeader()}
    <div class="stats-row mb">
      <div class="stat"><div class="v">${state.history.length}</div><div class="k">Séances</div></div>
      <div class="stat"><div class="v">${state.xp}</div><div class="k">XP total</div></div>
      <div class="stat"><div class="v">🔥 ${streakAlive() ? state.streak.count : 0}</div><div class="k">Série</div></div>
    </div>

    <h2>${isTrainingDay ? '💪 Séance du jour' : '😴 Repos prévu aujourd\'hui'}</h2>
    ${active && day ? `
      <div class="card glow">
        <div class="row between">
          <div>
            <h3>${active.emoji} ${esc(day.name)}</h3>
            <p class="muted">${esc(active.name)} — ${day.items.length} exercices</p>
          </div>
        </div>
        <button class="btn mt" id="start-session">▶ Lancer la séance</button>
      </div>` : `
      <div class="card center">
        <p class="muted mb">Aucun programme actif. Choisis un programme préconçu ou crée le tien !</p>
        <button class="btn" id="goto-programs">Choisir un programme</button>
      </div>`}

    ${recent.length ? `
      <h2 class="mt">📜 Dernières séances</h2>
      ${recent.map(h => `
        <div class="card row between" style="padding:12px 16px">
          <div><h3 style="font-size:14px">${esc(h.dayName)}</h3><p class="muted" style="font-size:12px">${esc(h.programName)} — ${new Date(h.date).toLocaleDateString('fr-FR')}</p></div>
          <span class="accent" style="font-weight:800">+${h.xp} XP</span>
        </div>`).join('')}` : ''}`;

  $('#start-session')?.addEventListener('click', () => startSession(active.id, nextDayIndex(active)));
  $('#goto-programs')?.addEventListener('click', () => nav('programs'));
}

// ═══════════════ PROGRAMMES ═══════════════
let progFilter = 'tous';

function renderPrograms() {
  const list = allPrograms().filter(p =>
    progFilter === 'tous' ? true : progFilter === 'persos' ? p.custom : p.sport === progFilter);

  app.innerHTML = `
    <h1>Programmes</h1>
    <p class="muted mb">Préconçus par niveau, ou crée le tien sur mesure.</p>
    <div class="chips mb">
      ${[['tous', '✨ Tous'], ...SPORTS.map(s => [s.id, `${s.emoji} ${s.name.split(' ')[0]}`]), ['persos', '🛠️ Mes programmes']]
        .map(([id, lbl]) => `<button class="chip ${progFilter === id ? 'on' : ''}" data-f="${id}">${lbl}</button>`).join('')}
    </div>
    <button class="btn mb" id="create-prog">＋ Créer mon programme</button>
    ${list.map(p => `
      <div class="card prog-card" data-id="${p.id}">
        <div class="row">
          <span class="prog-emoji">${p.emoji}</span>
          <div style="flex:1">
            <h3>${esc(p.name)}</h3>
            <p class="muted" style="font-size:13px;margin:4px 0 8px">${esc(p.goal)}</p>
            <span class="tag ${DIFF_TAG[p.difficulty]}">${p.difficulty}</span>
            <span class="tag">${p.daysPerWeek} j/sem</span>
            ${p.custom ? '<span class="tag">🛠️ perso</span>' : ''}
            ${state.activeProgramId === p.id ? '<span class="tag active-tag">ACTIF ✓</span>' : ''}
          </div>
        </div>
      </div>`).join('') || '<p class="muted center mt">Aucun programme ici pour l\'instant.</p>'}`;

  $$('.chip[data-f]').forEach(c => c.onclick = () => { progFilter = c.dataset.f; render(); });
  $('#create-prog').onclick = () => nav('builder');
  $$('.prog-card').forEach(c => c.onclick = () => nav('program', { id: c.dataset.id }));
}

function renderProgramDetail() {
  const p = findProgram(route.params.id);
  if (!p) return nav('programs');
  const isActive = state.activeProgramId === p.id;

  app.innerHTML = `
    <button class="back-btn" id="back">← Programmes</button>
    <div class="card glow">
      <div class="row">
        <span class="prog-emoji">${p.emoji}</span>
        <div><h2 style="margin:0">${esc(p.name)}</h2>
        <span class="tag ${DIFF_TAG[p.difficulty]}">${p.difficulty}</span><span class="tag">${p.daysPerWeek} j/sem</span></div>
      </div>
      <p class="muted mt">${esc(p.goal)}</p>
      <button class="btn mt" id="activate" ${isActive ? 'disabled' : ''}>${isActive ? '✓ Programme actif' : '⚡ Activer ce programme'}</button>
      ${p.custom ? '<button class="btn danger mt" id="delete-prog">Supprimer ce programme</button>' : ''}
    </div>
    ${p.days.map((d, i) => `
      <div class="card">
        <div class="row between">
          <h3>${esc(d.name)}</h3>
          <button class="btn small secondary start-day" data-i="${i}">▶ Faire</button>
        </div>
        <div class="mt">${d.items.map(it => `
          <div class="row between" style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">
            <span style="font-size:14px">${esc(it.n)}</span>
            <span class="muted" style="font-size:13px;white-space:nowrap;margin-left:10px">${esc(it.d)}</span>
          </div>`).join('')}</div>
      </div>`).join('')}`;

  $('#back').onclick = () => nav('programs');
  $('#activate').onclick = () => {
    state.activeProgramId = p.id;
    save();
    toast(`⚡ ${p.name} activé !`);
    nav('dashboard');
  };
  $('#delete-prog')?.addEventListener('click', () => {
    if (!confirm('Supprimer ce programme ?')) return;
    state.customPrograms = state.customPrograms.filter(c => c.id !== p.id);
    if (state.activeProgramId === p.id) state.activeProgramId = null;
    save();
    nav('programs');
  });
  $$('.start-day').forEach(b => b.onclick = e => { e.stopPropagation(); startSession(p.id, +b.dataset.i); });
}

// ═══════════════ CRÉATEUR DE PROGRAMME ═══════════════
let builderDraft = null;

function renderBuilder() {
  builderDraft = builderDraft || { name: '', sport: state.profile.sports[0] || 'salle', days: [], search: '', currentDay: 0 };
  const b = builderDraft;

  const lib = EXERCISES.filter(e =>
    (!b.search || e.name.toLowerCase().includes(b.search.toLowerCase()) || e.cat.toLowerCase().includes(b.search.toLowerCase())));

  app.innerHTML = `
    <button class="back-btn" id="back">← Annuler</button>
    <h1>Créer mon programme</h1>
    <div class="card">
      <label class="field">Nom du programme
        <input type="text" id="b-name" maxlength="30" placeholder="Ex : Mon PPL custom" value="${esc(b.name)}">
      </label>
      <label class="field">Sport principal
        <div class="chips">${SPORTS.map(s => `<button class="chip ${b.sport === s.id ? 'on' : ''}" data-sport="${s.id}">${s.emoji} ${s.name}</button>`).join('')}</div>
      </label>
      <button class="btn secondary" id="add-day">＋ Ajouter une séance</button>
    </div>

    ${b.days.map((d, di) => `
      <div class="card ${b.currentDay === di ? 'glow' : ''}" data-day="${di}">
        <div class="row between">
          <input type="text" class="day-name" data-di="${di}" value="${esc(d.name)}" style="font-weight:700;background:none;border:none;padding:4px 0;font-size:16px">
          <button class="btn small danger del-day" data-di="${di}">✕</button>
        </div>
        ${d.items.map((it, ii) => `
          <div class="row between" style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">
            <span style="font-size:14px">${esc(it.n)}</span>
            <span class="row" style="gap:6px">
              <input type="text" class="item-d" data-di="${di}" data-ii="${ii}" value="${esc(it.d)}" style="width:90px;padding:5px 8px;font-size:13px">
              <button class="btn small danger del-item" data-di="${di}" data-ii="${ii}">✕</button>
            </span>
          </div>`).join('')}
        <button class="btn small secondary mt sel-day" data-di="${di}">${b.currentDay === di ? '✓ Séance sélectionnée' : 'Ajouter des exos ici'}</button>
      </div>`).join('')}

    ${b.days.length ? `
      <div class="card">
        <h3 class="mb">Bibliothèque d'exercices</h3>
        <input type="text" id="b-search" placeholder="🔍 Rechercher (ex : tractions, jambes…)" value="${esc(b.search)}">
        <div class="mt" style="max-height:300px;overflow-y:auto">
          ${lib.map((e, i) => `
            <div class="row between" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
              <div><span style="font-size:14px">${esc(e.name)}</span> <span class="tag">${e.cat}</span></div>
              <button class="btn small add-exo" data-name="${esc(e.name)}">＋</button>
            </div>`).join('')}
        </div>
      </div>` : '<p class="muted center">Ajoute au moins une séance pour commencer.</p>'}

    <button class="btn mt" id="b-save" ${b.days.length && b.days.some(d => d.items.length) ? '' : 'disabled'}>💾 Enregistrer le programme</button>`;

  const keep = () => { b.name = $('#b-name').value; b.search = $('#b-search')?.value || b.search; syncInputs(); };
  const syncInputs = () => {
    $$('.day-name').forEach(i => b.days[+i.dataset.di].name = i.value);
    $$('.item-d').forEach(i => b.days[+i.dataset.di].items[+i.dataset.ii].d = i.value);
  };

  $('#back').onclick = () => { builderDraft = null; nav('programs'); };
  $$('.chip[data-sport]').forEach(c => c.onclick = () => { keep(); b.sport = c.dataset.sport; render(); });
  $('#add-day').onclick = () => { keep(); b.days.push({ name: `Séance ${b.days.length + 1}`, items: [] }); b.currentDay = b.days.length - 1; render(); };
  $$('.del-day').forEach(btn => btn.onclick = () => { keep(); b.days.splice(+btn.dataset.di, 1); b.currentDay = 0; render(); });
  $$('.sel-day').forEach(btn => btn.onclick = () => { keep(); b.currentDay = +btn.dataset.di; render(); });
  $$('.del-item').forEach(btn => btn.onclick = () => { keep(); b.days[+btn.dataset.di].items.splice(+btn.dataset.ii, 1); render(); });
  $$('.add-exo').forEach(btn => btn.onclick = () => {
    keep();
    if (!b.days[b.currentDay]) return;
    b.days[b.currentDay].items.push({ n: btn.dataset.name, d: '3×10' });
    render();
  });
  $('#b-search')?.addEventListener('input', e => { keep(); b.search = e.target.value; render(); $('#b-search').focus(); $('#b-search').setSelectionRange(b.search.length, b.search.length); });

  $('#b-save').onclick = () => {
    keep();
    const name = b.name.trim() || 'Mon programme';
    state.customPrograms.push({
      id: 'custom-' + Date.now(), custom: true, sport: b.sport,
      difficulty: 'intermédiaire', daysPerWeek: b.days.length,
      name, emoji: '🛠️', goal: 'Programme personnalisé créé par ' + state.profile.name + '.',
      days: b.days.filter(d => d.items.length),
    });
    save();
    builderDraft = null;
    toast('💾 Programme créé !');
    nav('programs');
  };
}

// ═══════════════ SÉANCE ═══════════════
function startSession(programId, dayIndex) {
  state.session = { programId, dayIndex, checked: [], startedAt: Date.now() };
  save();
  nav('session');
}

function renderSession() {
  const s = state.session;
  const p = s && findProgram(s.programId);
  if (!p) return nav('dashboard');
  const day = p.days[s.dayIndex];

  app.innerHTML = `
    <button class="back-btn" id="quit">← Abandonner la séance</button>
    <h1>${p.emoji} ${esc(day.name)}</h1>
    <p class="muted mb">${esc(p.name)} — coche les exercices au fur et à mesure. <span id="timer" class="accent"></span></p>
    ${day.items.map((it, i) => `
      <div class="exo ${s.checked.includes(i) ? 'done' : ''}" data-i="${i}">
        <div class="check">✓</div>
        <div style="flex:1"><div class="exo-name" style="font-weight:600">${esc(it.n)}</div><div class="muted" style="font-size:13px">${esc(it.d)}</div></div>
      </div>`).join('')}
    <button class="btn mt" id="finish" ${s.checked.length ? '' : 'disabled'}>
      🏁 Terminer la séance (${s.checked.length}/${day.items.length})
    </button>`;

  const tick = () => {
    const el = $('#timer');
    if (!el || !state.session) return;
    const sec = Math.floor((Date.now() - s.startedAt) / 1000);
    el.textContent = `⏱ ${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    setTimeout(tick, 1000);
  };
  tick();

  $$('.exo').forEach(el => el.onclick = () => {
    const i = +el.dataset.i;
    s.checked.includes(i) ? s.checked.splice(s.checked.indexOf(i), 1) : s.checked.push(i);
    save();
    render();
  });
  $('#quit').onclick = () => {
    if (confirm('Abandonner ? Aucune XP ne sera gagnée.')) { state.session = null; save(); nav('dashboard'); }
  };
  $('#finish').onclick = finishSession;
}

function finishSession() {
  const s = state.session;
  const p = findProgram(s.programId);
  const day = p.days[s.dayIndex];
  const before = playerLevel();
  const durationMin = Math.round((Date.now() - s.startedAt) / 60000);
  const streak = bumpStreak();

  const xp = workoutXp({
    exercisesDone: s.checked.length, totalExercises: day.items.length,
    durationMin, difficulty: p.difficulty, streak,
  });

  state.xp += xp;
  state.history.push({
    date: new Date().toISOString(), programName: p.name, dayName: day.name,
    xp, durationMin, exercisesDone: s.checked.length,
  });
  state.dayProgress = state.dayProgress || {};
  state.dayProgress[p.id] = (s.dayIndex + 1) % p.days.length;
  state.session = null;

  const after = playerLevel();
  const newSkins = SKINS.filter(sk => sk.level > before.level && sk.level <= after.level);
  save();
  nav('reward', { xp, before: before.level, after: after.level, newSkins, streak });
}

function renderReward() {
  const { xp, before, after, newSkins, streak } = route.params;
  const rank = rankForLevel(after);
  app.innerHTML = `
    <div class="reward">
      <p class="muted">SÉANCE TERMINÉE</p>
      <div class="big-xp">+${xp} XP</div>
      ${streak > 1 ? `<p class="mt">🔥 Série de <b>${streak} jours</b> — bonus d'XP actif !</p>` : ''}
      ${after > before ? `
        <div class="levelup">
          <div style="font-size:34px">🆙</div>
          <h2>NIVEAU ${after} !</h2>
          <p class="muted">${rank.icon} Rang ${rank.name}</p>
        </div>` : ''}
      ${(newSkins || []).map(sk => `
        <div class="levelup">
          <div class="dot" style="width:30px;height:30px;border-radius:50%;margin:0 auto 8px;background:linear-gradient(135deg,${sk.accent},${sk.accent2})"></div>
          <h3>🎨 Skin débloqué : ${sk.name} !</h3>
          <p class="muted" style="font-size:12px">Équipe-le dans ton profil</p>
        </div>`).join('')}
      <button class="btn mt" id="continue">Continuer</button>
    </div>`;
  $('#continue').onclick = () => nav('dashboard');
}

// ═══════════════ QUÊTES ═══════════════
function weekKey() {
  const d = new Date();
  const onejan = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil((((d - onejan) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-w${week}`;
}

function questList() {
  const today = new Date().toISOString().slice(0, 10);
  const wk = weekKey();
  const todayCount = state.history.filter(h => h.date.slice(0, 10) === today).length;
  const weekCount = state.history.filter(h => {
    const d = new Date(h.date);
    const monday = new Date(); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7)); monday.setHours(0, 0, 0, 0);
    return d >= monday;
  }).length;
  const streak = streakAlive() ? state.streak.count : 0;

  return [
    { id: `daily-${today}`, name: 'Faire une séance aujourd\'hui', icon: '☀️', xp: 30, done: todayCount >= 1 },
    { id: `week3-${wk}`, name: '3 séances cette semaine', icon: '🎯', xp: 100, done: weekCount >= 3, progress: `${Math.min(weekCount, 3)}/3` },
    { id: `week5-${wk}`, name: '5 séances cette semaine', icon: '💪', xp: 200, done: weekCount >= 5, progress: `${Math.min(weekCount, 5)}/5` },
    { id: `streak7-${wk}`, name: 'Série de 7 jours d\'affilée', icon: '🔥', xp: 250, done: streak >= 7, progress: `${Math.min(streak, 7)}/7` },
  ];
}

function renderQuests() {
  state.claimed = state.claimed || {};
  const quests = questList();
  app.innerHTML = `
    <h1>Quêtes</h1>
    <p class="muted mb">De l'XP bonus en plus de tes séances. Les quêtes se réinitialisent chaque jour / semaine.</p>
    ${quests.map(q => {
      const claimed = state.claimed[q.id];
      return `
      <div class="card row between">
        <div class="row"><span style="font-size:26px">${q.icon}</span>
          <div><h3 style="font-size:15px">${q.name}</h3>
          <p class="muted" style="font-size:12px">+${q.xp} XP ${q.progress ? `— ${q.progress}` : ''}</p></div>
        </div>
        <button class="btn small claim" data-id="${q.id}" data-xp="${q.xp}" ${q.done && !claimed ? '' : 'disabled'}>
          ${claimed ? '✓ Récupéré' : q.done ? 'Récupérer' : 'En cours'}
        </button>
      </div>`;
    }).join('')}`;

  $$('.claim').forEach(b => b.onclick = () => {
    state.claimed[b.dataset.id] = true;
    const before = playerLevel().level;
    state.xp += +b.dataset.xp;
    save();
    const after = playerLevel().level;
    toast(`✦ +${b.dataset.xp} XP de quête !`);
    if (after > before) toast(`🆙 NIVEAU ${after} !`);
    render();
  });
}

// ═══════════════ PROFIL ═══════════════
function renderProfile() {
  const lv = playerLevel();
  const rank = rankForLevel(lv.level);
  const nextRank = [...SKINS].filter(s => s.level > lv.level)[0];
  const unlocked = unlockedSkins(lv.level).map(s => s.id);

  app.innerHTML = `
    ${playerHeader()}
    <div class="stats-row mb">
      <div class="stat"><div class="v">${state.history.length}</div><div class="k">Séances</div></div>
      <div class="stat"><div class="v">🔥 ${state.streak.best}</div><div class="k">Record série</div></div>
      <div class="stat"><div class="v">${Math.round(state.history.reduce((a, h) => a + (h.durationMin || 0), 0) / 60)} h</div><div class="k">Temps total</div></div>
    </div>

    <h2>🎨 Skins (${unlocked.length}/${SKINS.length})</h2>
    <div class="card">
      <div class="skin-grid">
        ${SKINS.map(s => {
          const isUnlocked = unlocked.includes(s.id);
          return `
          <div class="skin ${state.skin === s.id ? 'equipped' : ''} ${isUnlocked ? '' : 'locked'}" data-id="${s.id}" data-locked="${!isUnlocked}">
            <div class="dot" style="background:linear-gradient(135deg,${s.accent},${s.accent2})"></div>
            <span>${isUnlocked ? s.name : '🔒 lvl ' + s.level}</span>
          </div>`;
        }).join('')}
      </div>
      ${nextRank ? `<p class="muted mt" style="font-size:12px">Prochain skin : <b class="accent">${nextRank.name}</b> au niveau ${nextRank.level}</p>` : ''}
    </div>

    <h2 class="mt">⚙️ Mon profil</h2>
    <div class="card">
      <p><b>${esc(state.profile.name)}</b> — ${rank.icon} ${rank.name}</p>
      <p class="muted" style="font-size:13px;margin-top:6px">
        Sports : ${state.profile.sports.map(id => SPORTS.find(s => s.id === id)?.name).join(', ')}<br>
        Jours : ${state.profile.days.map(i => WEEKDAYS[i]).join(', ')}<br>
        XP restante jusqu'au niveau ${MAX_LEVEL} : ${(totalXpForLevel(MAX_LEVEL) - state.xp).toLocaleString('fr-FR')} XP
      </p>
      <button class="btn danger mt" id="reset">Réinitialiser toute ma progression</button>
    </div>`;

  $$('.skin').forEach(el => el.onclick = () => {
    if (el.dataset.locked === 'true') return toast(`🔒 Débloqué au niveau ${SKINS.find(s => s.id === el.dataset.id).level}`);
    state.skin = el.dataset.id;
    save();
    toast(`🎨 Skin ${SKINS.find(s => s.id === el.dataset.id).name} équipé !`);
    render();
  });
  $('#reset').onclick = () => {
    if (confirm('Tout supprimer ? Niveau, XP, programmes persos, historique… Irréversible !') && confirm('Vraiment sûr ? Retour au niveau 1.')) {
      resetAll();
      render();
    }
  };
}

// ─── Navigation bas de page ───
$('#navbar').onclick = e => {
  const btn = e.target.closest('.nav-btn');
  if (btn) nav(btn.dataset.route);
};

// ─── Reprise de séance en cours ───
if (state.session) route = { name: 'session', params: {} };
render();
