// ─── FitQuest — app principale ──────────────────────────────────────────────
import { state, save, resetAll, playerLevel, bumpStreak, streakAlive } from './store.js';
import { MAX_LEVEL, levelFromXp, rankForLevel, SKINS, unlockedSkins, workoutXp, xpForNext, totalXpForLevel } from './xp.js';
import { buildWeek, calcNutrition } from './planner.js';
import { PROGRAMS, SPORTS } from './data/programs.js';
import { EXERCISES, CATEGORIES, LVL_LABEL } from './data/exercises.js';
import { PROGRESSIONS, TRAINING_TIPS, MEALS } from './data/guide.js';

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];
const app = $('#app');
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const DIFF_TAG = { 'débutant': 'deb', 'intermédiaire': 'int', 'avancé': 'adv' };
const SPORT_EMOJI = { salle: '🏋️', course: '🏃', street: '🤸', repos: '😴' };
const sportName = id => SPORTS.find(s => s.id === id)?.name || id;

// ─── Migration des sauvegardes v1 ───
function migrate() {
  state.activePrograms = state.activePrograms || {};
  if (state.activeProgramId) {
    const p = findProgram(state.activeProgramId);
    if (p) state.activePrograms[p.sport] = p.id;
    state.activeProgramId = null;
    save();
  }
  if (state.profile && !state.profile.weeklyMix) {
    state.profile.weeklyMix = { [state.profile.sports[0]]: state.profile.days.length };
    save();
  }
}

// ─── Skins ───
function applySkin() {
  const skin = SKINS.find(s => s.id === state.skin) || SKINS[0];
  document.documentElement.style.setProperty('--accent', skin.accent);
  document.documentElement.style.setProperty('--accent2', skin.accent2);
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
    quests: renderQuests, guide: renderGuide, profile: renderProfile, plan: renderPlanEditor,
  };
  (views[route.name] || renderDashboard)();
}

// ═══════════════ Sélecteur jours + répartition (onboarding & édition) ═══════
function planFormHtml(d) {
  const total = Object.values(d.mix).reduce((a, b) => a + b, 0);
  const target = d.days.length;
  return `
    <label class="field">Tes jours d'entraînement (${target} jour${target > 1 ? 's' : ''} choisi${target > 1 ? 's' : ''})
      <div class="chips" id="pf-days">
        ${WEEKDAYS.map((w, i) => `<button class="chip ${d.days.includes(i) ? 'on' : ''}" data-i="${i}">${w}</button>`).join('')}
      </div>
    </label>
    ${d.days.length && d.sports.length ? `
    <label class="field">Répartition des séances — <b class="${total === target ? 'accent' : ''}">${total}/${target}</b> répartie${total > 1 ? 's' : ''}
      ${d.sports.map(id => `
        <div class="row between" style="padding:8px 0">
          <span>${SPORT_EMOJI[id]} ${sportName(id)}</span>
          <span class="row" style="gap:10px">
            <button class="btn small secondary pf-minus" data-s="${id}">−</button>
            <b style="min-width:18px;text-align:center">${d.mix[id] || 0}</b>
            <button class="btn small secondary pf-plus" data-s="${id}">＋</button>
          </span>
        </div>`).join('')}
      <p class="muted" style="font-size:12px">Ex : 4 street + 2 course sur 6 jours, le reste = repos. Les jours non cochés sont du repos.</p>
    </label>` : ''}`;
}

function wirePlanForm(d, rerender) {
  $('#pf-days').onclick = e => {
    const btn = e.target.closest('.chip');
    if (!btn) return;
    const i = +btn.dataset.i;
    d.days.includes(i) ? d.days.splice(d.days.indexOf(i), 1) : d.days.push(i);
    d.days.sort((a, b) => a - b);
    rerender();
  };
  $$('.pf-plus').forEach(b => b.onclick = () => {
    const total = Object.values(d.mix).reduce((a, c) => a + c, 0);
    if (total >= d.days.length) return toast('⚠️ Toutes tes séances sont déjà réparties — coche un jour de plus !');
    d.mix[b.dataset.s] = (d.mix[b.dataset.s] || 0) + 1;
    rerender();
  });
  $$('.pf-minus').forEach(b => b.onclick = () => {
    if ((d.mix[b.dataset.s] || 0) <= 0) return;
    d.mix[b.dataset.s]--;
    rerender();
  });
}

function planValid(d) {
  return d.days.length > 0 && Object.values(d.mix).reduce((a, b) => a + b, 0) === d.days.length;
}

// ═══════════════ ONBOARDING ═══════════════
const draft = { sports: [], days: [], mix: {} };

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
      ${planFormHtml(draft)}
      <button class="btn mt" id="ob-go">Commencer l'aventure — Niveau 1 🎮</button>
    </div>
    <p class="muted center">Chaque séance terminée te donne de l'XP.<br>Monte de niveau, débloque des skins, deviens une Légende.</p>`;

  const keepName = () => { draft.name = $('#ob-name').value; };
  $('#ob-sports').onclick = e => {
    const id = e.target.closest('.chip')?.dataset.id;
    if (!id) return;
    keepName();
    if (draft.sports.includes(id)) {
      draft.sports.splice(draft.sports.indexOf(id), 1);
      delete draft.mix[id];
    } else draft.sports.push(id);
    render();
  };
  wirePlanForm(draft, () => { keepName(); render(); });
  $('#ob-go').onclick = () => {
    const name = $('#ob-name').value.trim();
    if (!name) return toast('⚠️ Choisis un pseudo !');
    if (!draft.sports.length) return toast('⚠️ Choisis au moins un sport !');
    if (!draft.days.length) return toast('⚠️ Choisis tes jours d\'entraînement !');
    if (!planValid(draft)) return toast('⚠️ Répartis toutes tes séances entre tes sports !');
    state.profile = {
      name, sports: [...draft.sports], days: [...draft.days].sort((a, b) => a - b),
      weeklyMix: { ...draft.mix }, createdAt: new Date().toISOString(),
    };
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
  const week = buildWeek(state.profile.days, state.profile.weeklyMix);
  const today = (new Date().getDay() + 6) % 7; // 0 = lundi
  const sportToday = week[today] || 'repos';
  const progToday = sportToday !== 'repos' ? findProgram(state.activePrograms[sportToday]) : null;
  const dayToday = progToday ? progToday.days[nextDayIndex(progToday)] : null;
  const actives = Object.values(state.activePrograms).map(findProgram).filter(Boolean);
  const recent = [...state.history].slice(-5).reverse();

  app.innerHTML = `
    ${playerHeader()}
    <div class="stats-row mb">
      <div class="stat"><div class="v">${state.history.length}</div><div class="k">Séances</div></div>
      <div class="stat"><div class="v">${state.xp}</div><div class="k">XP total</div></div>
      <div class="stat"><div class="v">🔥 ${streakAlive() ? state.streak.count : 0}</div><div class="k">Série</div></div>
    </div>

    <div class="card" style="padding:12px">
      <div class="row between" style="gap:4px">
        ${WEEKDAYS.map((w, i) => `
          <div class="center" style="flex:1;padding:6px 2px;border-radius:10px;${i === today ? 'background:color-mix(in srgb, var(--accent) 16%, transparent);border:1px solid var(--accent)' : ''}">
            <div class="muted" style="font-size:10px">${w}</div>
            <div style="font-size:17px">${SPORT_EMOJI[week[i] || 'repos']}</div>
          </div>`).join('')}
      </div>
    </div>

    <h2>${sportToday === 'repos' ? '😴 Repos prévu aujourd\'hui' : `${SPORT_EMOJI[sportToday]} Aujourd'hui : ${sportName(sportToday)}`}</h2>
    ${progToday && dayToday ? `
      <div class="card glow">
        <h3>${progToday.emoji} ${esc(dayToday.name)}</h3>
        <p class="muted">${esc(progToday.name)} — ${dayToday.items.length} exercices</p>
        <button class="btn mt" id="start-session">▶ Lancer la séance</button>
      </div>` : sportToday !== 'repos' ? `
      <div class="card center">
        <p class="muted mb">Aucun programme actif en ${sportName(sportToday).toLowerCase()}. Choisis-en un !</p>
        <button class="btn" id="goto-programs" data-sport="${sportToday}">Choisir un programme ${SPORT_EMOJI[sportToday]}</button>
      </div>` : `
      <div class="card center">
        <p class="muted">La récupération fait partie de l'entraînement — c'est là que le muscle se construit 💤</p>
        ${actives.length ? '<p class="muted mt" style="font-size:13px">Envie quand même ? Lance une séance ci-dessous 👇</p>' : ''}
      </div>`}

    ${actives.length ? `
      <h2 class="mt">⚡ Mes programmes actifs</h2>
      ${actives.map(p => {
        const d = p.days[nextDayIndex(p)];
        return `
        <div class="card row between" style="padding:12px 16px">
          <div><h3 style="font-size:14px">${p.emoji} ${esc(p.name)}</h3><p class="muted" style="font-size:12px">Prochaine : ${esc(d.name)}</p></div>
          <button class="btn small secondary quick-start" data-id="${p.id}">▶</button>
        </div>`;
      }).join('')}` : ''}

    ${recent.length ? `
      <h2 class="mt">📜 Dernières séances</h2>
      ${recent.map(h => `
        <div class="card row between" style="padding:12px 16px">
          <div><h3 style="font-size:14px">${esc(h.dayName)}</h3><p class="muted" style="font-size:12px">${esc(h.programName)} — ${new Date(h.date).toLocaleDateString('fr-FR')}</p></div>
          <span class="accent" style="font-weight:800">+${h.xp} XP</span>
        </div>`).join('')}` : ''}`;

  $('#start-session')?.addEventListener('click', () => startSession(progToday.id, nextDayIndex(progToday)));
  $('#goto-programs')?.addEventListener('click', e => { progFilter = e.target.closest('button').dataset.sport; nav('programs'); });
  $$('.quick-start').forEach(b => b.onclick = () => { const p = findProgram(b.dataset.id); startSession(p.id, nextDayIndex(p)); });
}

// ═══════════════ PROGRAMMES ═══════════════
let progFilter = 'tous';

function renderPrograms() {
  const list = allPrograms().filter(p =>
    progFilter === 'tous' ? true : progFilter === 'persos' ? p.custom : p.sport === progFilter);

  app.innerHTML = `
    <h1>Programmes</h1>
    <p class="muted mb">Préconçus par niveau, ou crée le tien. Tu peux activer <b>un programme par sport</b>.</p>
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
            ${state.activePrograms[p.sport] === p.id ? '<span class="tag active-tag">ACTIF ✓</span>' : ''}
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
  const isActive = state.activePrograms[p.sport] === p.id;

  app.innerHTML = `
    <button class="back-btn" id="back">← Programmes</button>
    <div class="card glow">
      <div class="row">
        <span class="prog-emoji">${p.emoji}</span>
        <div><h2 style="margin:0">${esc(p.name)}</h2>
        <span class="tag ${DIFF_TAG[p.difficulty]}">${p.difficulty}</span><span class="tag">${p.daysPerWeek} j/sem</span><span class="tag">${SPORT_EMOJI[p.sport]} ${sportName(p.sport)}</span></div>
      </div>
      <p class="muted mt">${esc(p.goal)}</p>
      <button class="btn mt" id="activate" ${isActive ? 'disabled' : ''}>${isActive ? '✓ Programme actif' : `⚡ Activer comme programme ${sportName(p.sport).toLowerCase()}`}</button>
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
    state.activePrograms[p.sport] = p.id;
    save();
    toast(`⚡ ${p.name} activé pour ${sportName(p.sport).toLowerCase()} !`);
    nav('dashboard');
  };
  $('#delete-prog')?.addEventListener('click', () => {
    if (!confirm('Supprimer ce programme ?')) return;
    state.customPrograms = state.customPrograms.filter(c => c.id !== p.id);
    if (state.activePrograms[p.sport] === p.id) delete state.activePrograms[p.sport];
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
              <input type="text" class="item-d" data-di="${di}" data-ii="${ii}" value="${esc(it.d)}" style="width:110px;padding:5px 8px;font-size:13px">
              <button class="btn small danger del-item" data-di="${di}" data-ii="${ii}">✕</button>
            </span>
          </div>`).join('')}
        <button class="btn small secondary mt sel-day" data-di="${di}">${b.currentDay === di ? '✓ Séance sélectionnée' : 'Ajouter des exos ici'}</button>
      </div>`).join('')}

    ${b.days.length ? `
      <div class="card">
        <h3 class="mb">Bibliothèque (${EXERCISES.length} exercices)</h3>
        <input type="text" id="b-search" placeholder="🔍 Rechercher (ex : tractions, jambes, skills…)" value="${esc(b.search)}">
        <div class="mt" style="max-height:300px;overflow-y:auto">
          ${lib.map(e => `
            <div class="row between" style="padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
              <div><span style="font-size:14px">${esc(e.name)}</span><br><span class="tag">${e.cat}</span><span class="tag ${['', 'deb', 'int', 'adv'][e.lvl]}">${LVL_LABEL[e.lvl]}</span><span class="tag">${esc(e.reps)}</span></div>
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
    const ex = EXERCISES.find(e => e.name === btn.dataset.name);
    b.days[b.currentDay].items.push({ n: btn.dataset.name, d: ex?.reps || '3×10' });
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
  const target = state.profile.days.length;

  return [
    { id: `daily-${today}`, name: 'Faire une séance aujourd\'hui', icon: '☀️', xp: 30, done: todayCount >= 1 },
    { id: `week3-${wk}`, name: '3 séances cette semaine', icon: '🎯', xp: 100, done: weekCount >= 3, progress: `${Math.min(weekCount, 3)}/3` },
    { id: `weekfull-${wk}`, name: `Semaine parfaite (${target} séances prévues)`, icon: '💪', xp: 200, done: weekCount >= target, progress: `${Math.min(weekCount, target)}/${target}` },
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

// ═══════════════ GUIDE (muscle, progressions, nutrition) ═══════════════
function renderGuide() {
  const n = state.nutrition || {};
  const seances = Object.values(state.profile.weeklyMix || {}).reduce((a, b) => a + b, 0);
  const macros = n.poids ? calcNutrition({ ...n, seances }) : null;
  const meals = MEALS[n.objectif || 'masse'];

  app.innerHTML = `
    <h1>Guide</h1>
    <p class="muted mb">Comment se muscler vite, faire évoluer ses exercices, et quoi manger.</p>

    <h2>💪 Se muscler rapidement</h2>
    ${TRAINING_TIPS.map(t => `
      <div class="card" style="padding:14px 16px">
        <h3 style="font-size:15px">${t.icon} ${t.title}</h3>
        <p class="muted" style="font-size:13px;margin-top:6px">${t.body}</p>
      </div>`).join('')}

    <h2 class="mt">📈 Évolutions d'exercices</h2>
    <p class="muted mb" style="font-size:13px">Quand une étape devient facile (tu dépasses la fourchette de reps), passe à la suivante.</p>
    ${PROGRESSIONS.map(pr => `
      <div class="card">
        <h3>${pr.emoji} ${pr.name}</h3>
        <div class="mt">${pr.steps.map((st, i) => `
          <div class="row" style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">
            <span class="accent" style="font-weight:800;min-width:46px;font-size:12px">ÉTAPE ${i + 1}</span>
            <span style="flex:1;font-size:14px">${esc(st.n)}</span>
            <span class="muted" style="font-size:12px;white-space:nowrap">${esc(st.d)}</span>
          </div>`).join('')}</div>
      </div>`).join('')}

    <h2 class="mt">🍗 Nutrition</h2>
    <div class="card">
      <div class="grid2">
        <label class="field">Sexe
          <select id="nu-sexe"><option value="h" ${n.sexe !== 'f' ? 'selected' : ''}>Homme</option><option value="f" ${n.sexe === 'f' ? 'selected' : ''}>Femme</option></select>
        </label>
        <label class="field">Âge
          <input type="number" id="nu-age" min="14" max="99" value="${n.age || ''}" placeholder="20">
        </label>
        <label class="field">Poids (kg)
          <input type="number" id="nu-poids" min="35" max="200" value="${n.poids || ''}" placeholder="70">
        </label>
        <label class="field">Taille (cm)
          <input type="number" id="nu-taille" min="120" max="230" value="${n.taille || ''}" placeholder="178">
        </label>
      </div>
      <label class="field">Objectif
        <select id="nu-obj">
          <option value="masse" ${n.objectif === 'masse' || !n.objectif ? 'selected' : ''}>💪 Prise de muscle</option>
          <option value="maintien" ${n.objectif === 'maintien' ? 'selected' : ''}>⚖️ Maintien / recomposition</option>
          <option value="seche" ${n.objectif === 'seche' ? 'selected' : ''}>🔥 Sèche (perte de gras)</option>
        </select>
      </label>
      <button class="btn" id="nu-calc">Calculer mes besoins</button>
      ${macros ? `
        <div class="stats-row mt" style="grid-template-columns:repeat(4,1fr)">
          <div class="stat"><div class="v">${macros.kcal}</div><div class="k">kcal/j</div></div>
          <div class="stat"><div class="v">${macros.proteines} g</div><div class="k">Protéines</div></div>
          <div class="stat"><div class="v">${macros.glucides} g</div><div class="k">Glucides</div></div>
          <div class="stat"><div class="v">${macros.lipides} g</div><div class="k">Lipides</div></div>
        </div>
        <p class="muted mt" style="font-size:12px">Basé sur ${seances} séance${seances > 1 ? 's' : ''}/semaine (Mifflin-St Jeor). Pèse-toi 1×/semaine et ajuste de ±200 kcal selon l'évolution.</p>` : ''}
    </div>
    ${macros ? `
    <div class="card">
      <h3>🍽️ Journée type — ${meals.title}</h3>
      <div class="mt">${meals.items.map(m => `
        <div style="padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <b style="font-size:13px">${m.t}</b>
          <p class="muted" style="font-size:13px">${m.d}</p>
        </div>`).join('')}</div>
    </div>` : ''}`;

  $('#nu-calc').onclick = () => {
    const data = {
      sexe: $('#nu-sexe').value, age: +$('#nu-age').value,
      poids: +$('#nu-poids').value, taille: +$('#nu-taille').value,
      objectif: $('#nu-obj').value,
    };
    if (!data.age || !data.poids || !data.taille) return toast('⚠️ Remplis âge, poids et taille !');
    state.nutrition = data;
    save();
    toast('🍗 Besoins calculés !');
    render();
  };
}

// ═══════════════ ÉDITEUR DE PLANNING ═══════════════
let planDraft = null;

function renderPlanEditor() {
  planDraft = planDraft || {
    sports: [...state.profile.sports],
    days: [...state.profile.days],
    mix: { ...state.profile.weeklyMix },
  };
  const d = planDraft;

  app.innerHTML = `
    <button class="back-btn" id="back">← Profil</button>
    <h1>Mon planning</h1>
    <p class="muted mb">Choisis tes sports, tes jours, et combien de séances de chaque par semaine.</p>
    <div class="card">
      <label class="field">Mes sports
        <div class="chips" id="pe-sports">
          ${SPORTS.map(s => `<button class="chip ${d.sports.includes(s.id) ? 'on' : ''}" data-id="${s.id}">${s.emoji} ${s.name}</button>`).join('')}
        </div>
      </label>
      ${planFormHtml(d)}
      <button class="btn mt" id="pe-save">💾 Enregistrer mon planning</button>
    </div>`;

  $('#pe-sports').onclick = e => {
    const id = e.target.closest('.chip')?.dataset.id;
    if (!id) return;
    if (d.sports.includes(id)) {
      d.sports.splice(d.sports.indexOf(id), 1);
      delete d.mix[id];
    } else d.sports.push(id);
    render();
  };
  wirePlanForm(d, render);
  $('#back').onclick = () => { planDraft = null; nav('profile'); };
  $('#pe-save').onclick = () => {
    if (!d.sports.length) return toast('⚠️ Choisis au moins un sport !');
    if (!planValid(d)) return toast('⚠️ Répartis toutes tes séances entre tes sports !');
    Object.assign(state.profile, { sports: [...d.sports], days: [...d.days], weeklyMix: { ...d.mix } });
    save();
    planDraft = null;
    toast('📅 Planning mis à jour !');
    nav('dashboard');
  };
}

// ═══════════════ PROFIL ═══════════════
function renderProfile() {
  const lv = playerLevel();
  const rank = rankForLevel(lv.level);
  const nextSkin = SKINS.filter(s => s.level > lv.level)[0];
  const unlocked = unlockedSkins(lv.level).map(s => s.id);
  const mix = state.profile.weeklyMix || {};

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
      ${nextSkin ? `<p class="muted mt" style="font-size:12px">Prochain skin : <b class="accent">${nextSkin.name}</b> au niveau ${nextSkin.level}</p>` : ''}
    </div>

    <h2 class="mt">📅 Mon planning</h2>
    <div class="card">
      <p style="font-size:14px">${Object.entries(mix).map(([s, c]) => `${SPORT_EMOJI[s]} ${c}× ${sportName(s).toLowerCase()}`).join(' + ')} — ${7 - state.profile.days.length} j de repos</p>
      <p class="muted" style="font-size:13px;margin-top:4px">Jours : ${state.profile.days.map(i => WEEKDAYS[i]).join(', ')}</p>
      <button class="btn secondary mt" id="edit-plan">✏️ Modifier sports / jours / répartition</button>
    </div>

    <h2 class="mt">⚙️ Mon profil</h2>
    <div class="card">
      <p><b>${esc(state.profile.name)}</b> — ${rank.icon} ${rank.name}</p>
      <p class="muted" style="font-size:13px;margin-top:6px">
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
  $('#edit-plan').onclick = () => nav('plan');
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

// ─── Démarrage ───
migrate();
if (state.session) route = { name: 'session', params: {} };
render();
