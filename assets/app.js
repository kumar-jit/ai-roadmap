/* Zero to Your Own Model — roadmap tracker.
 *
 * No framework, no build step. Renders the tree from roadmap.data.js, keeps
 * progress in localStorage, and optionally mirrors it to Firestore.
 */

import { ROADMAP } from './roadmap.data.js';
import { CONFIG } from './config.js';

const STORE_KEY = 'zttym-progress-v1';
const THEME_KEY = 'zttym-theme';
const EMAIL_KEY = 'zttym-email';

/** Email of the signed-in account, or '' when sync is off / not signed in yet. */
let activeEmail = '';

/* ------------------------------------------------------------------ *
 * State
 * ------------------------------------------------------------------ */

/** id -> 1 for every completed item. Absent means not done. */
const state = Object.create(null);

/** Flat list of every rendered item, for search and progress maths. */
const ITEMS = [];

/** Flat list of every rendered group, so a group title is searchable too. */
const GROUPS = [];

/** True while we are writing the DOM from state, so change handlers no-op. */
let applying = false;

/* ------------------------------------------------------------------ *
 * Render
 * ------------------------------------------------------------------ */

const main = document.getElementById('main');
const index = document.getElementById('index');

ROADMAP.forEach((stage, si) => {
  const sec = document.createElement('section');
  sec.className = 'stage';
  sec.id = 'stage-' + si;
  sec.style.setProperty('--sh', 'var(--s' + si + ')');

  const total = stage.g.reduce((n, g) => n + g.i.length, 0);

  const head = document.createElement('div');
  head.className = 'stage-head';
  head.innerHTML =
    '<div class="stage-no"></div>' +
    '<div><h2 class="stage-t"></h2><p class="stage-sub"></p>' +
    '<div class="stage-meta">' +
    '<span class="chip hue"></span><span class="chip"></span>' +
    '<span class="chip">' + total + ' topics</span>' +
    '</div></div>';
  head.querySelector('.stage-no').textContent = stage.no;
  head.querySelector('.stage-t').textContent = stage.t;
  head.querySelector('.stage-sub').textContent = stage.sub;
  head.querySelector('.chip.hue').textContent = stage.wk;
  head.querySelectorAll('.chip')[1].textContent = stage.hrs;
  sec.appendChild(head);

  const bar = document.createElement('div');
  bar.className = 'stage-bar';
  bar.innerHTML = '<i></i>';
  sec.appendChild(bar);

  const out = document.createElement('div');
  out.className = 'outcome';
  out.innerHTML = '<b>You leave this stage able to</b>';
  out.appendChild(document.createTextNode(stage.out));
  sec.appendChild(out);

  const tree = document.createElement('div');
  tree.className = 'tree';

  stage.g.forEach((group, gi) => {
    const gd = document.createElement('div');
    gd.className = 'group';

    const gh = document.createElement('button');
    gh.className = 'group-h';
    gh.type = 'button';
    gh.setAttribute('aria-expanded', 'true');
    gh.innerHTML =
      '<span class="caret"></span>' +
      '<span class="gno"></span><span class="gt"></span>' +
      '<span class="gc">0/' + group.i.length + '</span>';
    gh.querySelector('.gno').textContent = stage.no + '.' + (gi + 1);
    gh.querySelector('.gt').textContent = group.t;
    gh.addEventListener('click', () => {
      const collapsed = gd.classList.toggle('collapsed');
      gh.setAttribute('aria-expanded', String(!collapsed));
    });
    gd.appendChild(gh);

    const grec = {
      gd, gh,
      titleEl: gh.querySelector('.gt'),
      title: group.t,
      text: (group.t + ' ' + stage.t).toLowerCase(),
    };
    GROUPS.push(grec);

    const ul = document.createElement('ul');
    ul.className = 'items';

    group.i.forEach((item, ii) => {
      const id = 's' + si + '.' + gi + '.' + ii;

      const li = document.createElement('li');
      li.className = 'item' + (item.m ? ' ms' : '');
      li.dataset.id = id;

      const row = document.createElement('div');
      row.className = 'row';

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.id = 'cb-' + id;

      const label = document.createElement('label');
      label.className = 'lab';
      label.htmlFor = cb.id;

      const name = document.createElement('span');
      name.className = 'n';
      name.textContent = item.n;
      label.appendChild(name);

      if (item.w) {
        const why = document.createElement('span');
        why.className = 'w';
        why.textContent = item.w;
        label.appendChild(why);
      }

      row.append(cb, label);
      li.appendChild(row);
      ul.appendChild(li);

      const rec = {
        id, li, cb, si,
        group: grec,
        nameEl: name,
        whyEl: label.querySelector('.w'),
        name: item.n,
        why: item.w || '',
        // Only what is written on the row itself, so every hit is visibly a hit.
        text: (item.n + ' ' + (item.w || '')).toLowerCase(),
      };
      ITEMS.push(rec);

      cb.addEventListener('change', () => {
        if (applying) return;
        if (cb.checked) state[id] = 1; else delete state[id];
        li.classList.toggle('done', cb.checked);
        persist();
      });
    });

    gd.appendChild(ul);
    tree.appendChild(gd);
  });

  sec.appendChild(tree);
  main.appendChild(sec);

  const link = document.createElement('a');
  link.href = '#stage-' + si;
  link.style.setProperty('--sh', 'var(--s' + si + ')');
  link.innerHTML =
    '<span class="no"></span><span class="it"></span>' +
    '<span class="pc" data-pc="' + si + '">0%</span>';
  link.querySelector('.no').textContent = stage.no;
  link.querySelector('.it').textContent = stage.t;
  index.appendChild(link);
});

const TOTAL = ITEMS.length;

/* ------------------------------------------------------------------ *
 * Progress
 * ------------------------------------------------------------------ */

const el = {
  fill: document.getElementById('fill'),
  num: document.getElementById('num'),
  hdrProgress: document.getElementById('hdrProgress'),
  hdrPct: document.getElementById('hdrPct'),
  footprog: document.getElementById('footprog'),
  savenote: document.getElementById('savenote'),
};

function refresh() {
  let done = 0;
  const perStage = ROADMAP.map(() => [0, 0]);

  for (const rec of ITEMS) {
    const isDone = !!state[rec.id];
    perStage[rec.si][1]++;
    if (isDone) { done++; perStage[rec.si][0]++; }
  }

  const pct = TOTAL ? Math.round((done / TOTAL) * 100) : 0;
  el.fill.style.width = pct + '%';
  el.num.textContent = done + ' / ' + TOTAL;
  el.hdrProgress.firstChild.nodeValue = done + ' / ' + TOTAL;
  el.hdrPct.textContent = pct + '% complete';
  el.footprog.textContent = done + ' / ' + TOTAL + ' complete';

  perStage.forEach((counts, i) => {
    const sec = document.getElementById('stage-' + i);
    sec.querySelector('.stage-bar i').style.width =
      (counts[1] ? (counts[0] / counts[1]) * 100 : 0) + '%';
    const pc = document.querySelector('[data-pc="' + i + '"]');
    if (pc) pc.textContent = (counts[1] ? Math.round((counts[0] / counts[1]) * 100) : 0) + '%';
  });

  for (const gd of document.querySelectorAll('.group')) {
    const items = gd.querySelectorAll('.item');
    let d = 0;
    for (const li of items) if (li.classList.contains('done')) d++;
    gd.querySelector('.gc').textContent = d + '/' + items.length;
  }
}

/** Write `state` into the DOM. Use after loading or importing. */
function applyState() {
  applying = true;
  for (const rec of ITEMS) {
    const isDone = !!state[rec.id];
    rec.cb.checked = isDone;
    rec.li.classList.toggle('done', isDone);
  }
  applying = false;
  refresh();
}

function replaceState(next) {
  for (const k in state) delete state[k];
  Object.assign(state, next || {});
}

/* ------------------------------------------------------------------ *
 * Persistence — localStorage always, Firestore sync optionally
 * ------------------------------------------------------------------ */

function note(text, isError) {
  el.savenote.textContent = text;
  el.savenote.classList.toggle('err', !!isError);
}

/** The local cache is namespaced per account, so switching emails on the
 * same browser never mixes one person's ticks into another's. */
function localKey() {
  return activeEmail ? STORE_KEY + ':' + activeEmail : STORE_KEY;
}

function loadLocal() {
  try {
    const raw = localStorage.getItem(localKey());
    if (raw) replaceState(JSON.parse(raw));
    else replaceState({});
  } catch (err) {
    console.warn('Could not read saved progress:', err);
  }
}

function saveLocal() {
  try {
    localStorage.setItem(localKey(), JSON.stringify(state));
  } catch (err) {
    note('Progress could not be saved — browser storage is unavailable.', true);
  }
}

const sync = CONFIG.sync || {};
let syncTimer = null;

const FIREBASE_VERSION = '10.14.1';

/** Loaded lazily, only if sync is actually turned on — most visitors never
 * pay for this fetch. */
let firestore = null; // { db, doc, getDoc, setDoc }

async function ensureFirestore() {
  if (firestore) return firestore;
  const [{ initializeApp }, { getFirestore, doc, getDoc, setDoc }] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`),
  ]);
  const app = initializeApp(sync.firebaseConfig);
  firestore = { db: getFirestore(app), doc, getDoc, setDoc };
  return firestore;
}

/** The one document for this email: collection "progress", doc id = email,
 * fields are literally `{ "s0.0.0": true, ... }` — the item id is the key. */
async function progressRef() {
  const { db, doc } = await ensureFirestore();
  return doc(db, 'progress', activeEmail);
}

async function pullRemote() {
  const { getDoc } = await ensureFirestore();
  const snap = await getDoc(await progressRef());
  return snap.exists() ? snap.data() : {};
}

function pushRemote() {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(async () => {
    try {
      const { setDoc } = await ensureFirestore();
      const done = {};
      for (const id in state) done[id] = true;
      await setDoc(await progressRef(), done);
      note('Synced as ' + activeEmail + ' · ' + new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Firestore push failed:', err);
      note('Saved in this browser. Sync unreachable.', true);
    }
  }, 600);
}

function persist() {
  refresh();
  saveLocal();
  if (sync.enabled && activeEmail) pushRemote();
}

/* ------------------------------------------------------------------ *
 * Export / import
 * ------------------------------------------------------------------ */

function exportProgress() {
  const payload = {
    app: 'zero-to-your-own-model',
    version: 1,
    exportedAt: new Date().toISOString(),
    total: TOTAL,
    done: state,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'roadmap-progress-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      const done = parsed && parsed.done;
      if (!done || typeof done !== 'object') throw new Error('no "done" object in file');
      replaceState(done);
      applyState();
      saveLocal();
      if (sync.enabled && activeEmail) pushRemote();
      note('Imported ' + Object.keys(done).length + ' completed topics.');
    } catch (err) {
      note('That file is not a roadmap export: ' + err.message, true);
    }
  };
  reader.onerror = () => note('Could not read that file.', true);
  reader.readAsText(file);
}

/* ------------------------------------------------------------------ *
 * Controls
 * ------------------------------------------------------------------ */

const search = document.getElementById('q');

/** Default text for the status line, restored when the search box is cleared. */
function idleNote() {
  return sync.enabled && activeEmail
    ? 'Synced as ' + activeEmail
    : 'Progress saved in this browser · press / to search · Export for a backup';
}

/**
 * Rewrite `el`'s text with every occurrence of `term` wrapped in <mark>.
 * Built from text nodes rather than innerHTML, so curriculum text containing
 * angle brackets can never become markup.
 */
function highlight(el, text, term) {
  if (!el) return;
  el.textContent = '';
  const haystack = text.toLowerCase();
  let from = 0;
  let at = haystack.indexOf(term);

  while (at !== -1) {
    if (at > from) el.appendChild(document.createTextNode(text.slice(from, at)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(at, at + term.length);
    el.appendChild(mark);
    from = at + term.length;
    at = haystack.indexOf(term, from);
  }
  if (from < text.length) el.appendChild(document.createTextNode(text.slice(from)));
}

function clearSearch() {
  for (const rec of ITEMS) {
    rec.li.classList.remove('off', 'hit');
    rec.nameEl.textContent = rec.name;
    if (rec.whyEl) rec.whyEl.textContent = rec.why;
  }
  for (const grec of GROUPS) grec.titleEl.textContent = grec.title;
  for (const node of document.querySelectorAll('.group, .stage')) node.classList.remove('off');
  note(idleNote());
}

search.addEventListener('input', () => {
  const term = search.value.trim().toLowerCase();

  if (!term) {
    clearSearch();
    return;
  }

  // A group whose own title matches keeps all of its items — searching
  // "tokenisation" should show that group, not only rows repeating the word.
  for (const grec of GROUPS) {
    grec.matched = grec.text.includes(term);
    if (grec.matched) highlight(grec.titleEl, grec.title, term);
    else grec.titleEl.textContent = grec.title;
  }

  let hits = 0;
  for (const rec of ITEMS) {
    const own = rec.text.includes(term);
    const hit = own || rec.group.matched;
    if (hit) hits++;

    rec.li.classList.toggle('off', !hit);
    rec.li.classList.toggle('hit', hit);

    if (own) {
      highlight(rec.nameEl, rec.name, term);
      if (rec.whyEl) highlight(rec.whyEl, rec.why, term);
    } else {
      rec.nameEl.textContent = rec.name;
      if (rec.whyEl) rec.whyEl.textContent = rec.why;
    }
  }

  // Groups and stages with nothing left visible fold away.
  for (const grec of GROUPS) {
    grec.gd.classList.remove('collapsed');
    grec.gh.setAttribute('aria-expanded', 'true');
    grec.gd.classList.toggle('off', !grec.gd.querySelector('.item:not(.off)'));
  }
  for (const sec of document.querySelectorAll('.stage')) {
    sec.classList.toggle('off', !sec.querySelector('.item:not(.off)'));
  }

  note(
    hits
      ? hits + ' of ' + TOTAL + ' topics match “' + search.value.trim() + '”'
      : 'Nothing matches “' + search.value.trim() + '”'
  );
});

document.addEventListener('keydown', (e) => {
  if (e.key === '/' && document.activeElement !== search) {
    e.preventDefault();
    search.focus();
    search.select();
  }
  if (e.key === 'Escape' && document.activeElement === search) {
    search.value = '';
    clearSearch();
    search.blur();
  }
});

const hideDone = document.getElementById('toggleDone');
hideDone.addEventListener('click', () => {
  const on = hideDone.getAttribute('aria-pressed') !== 'true';
  hideDone.setAttribute('aria-pressed', String(on));
  document.body.classList.toggle('hidedone', on);
  hideDone.textContent = on ? 'Show done' : 'Hide done';
});

const collapseAll = document.getElementById('collapseAll');
collapseAll.addEventListener('click', () => {
  const anyOpen = !!document.querySelector('.group:not(.collapsed)');
  for (const gd of document.querySelectorAll('.group')) {
    gd.classList.toggle('collapsed', anyOpen);
    gd.querySelector('.group-h').setAttribute('aria-expanded', String(!anyOpen));
  }
  collapseAll.textContent = anyOpen ? 'Expand all' : 'Collapse all';
});

document.getElementById('reset').addEventListener('click', () => {
  const done = Object.keys(state).length;
  if (done && !confirm('Clear all ' + done + ' completed topics? Export first if you want a copy.')) return;
  replaceState({});
  applyState();
  saveLocal();
  if (sync.enabled && activeEmail) pushRemote();
});

document.getElementById('exportBtn').addEventListener('click', exportProgress);

const importFile = document.getElementById('importFile');
importFile.addEventListener('change', () => {
  if (importFile.files && importFile.files[0]) importProgress(importFile.files[0]);
  importFile.value = '';
});

/* Theme: system → light → dark → system */
const themeBtn = document.getElementById('theme');
const THEMES = ['system', 'light', 'dark'];

function readTheme() {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return THEMES.includes(t) ? t : 'system';
  } catch (err) {
    return 'system';
  }
}

function setTheme(next) {
  if (next === 'system') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', next);
  themeBtn.textContent = 'Theme: ' + next;
  try { localStorage.setItem(THEME_KEY, next); } catch (err) { /* not fatal */ }
}

themeBtn.addEventListener('click', () => {
  setTheme(THEMES[(THEMES.indexOf(readTheme()) + 1) % THEMES.length]);
});

/* ------------------------------------------------------------------ *
 * Login — only asked for when sync is on. No password: typing an email
 * is what makes it "your" account.
 * ------------------------------------------------------------------ */

const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginEmail = document.getElementById('loginEmail');
const accountBtn = document.getElementById('account');

function readEmail() {
  try { return (localStorage.getItem(EMAIL_KEY) || '').trim(); } catch (err) { return ''; }
}

function writeEmail(email) {
  try { localStorage.setItem(EMAIL_KEY, email); } catch (err) { /* not fatal */ }
}

function forgetEmail() {
  try { localStorage.removeItem(EMAIL_KEY); } catch (err) { /* not fatal */ }
}

function updateAccountButton() {
  const signedIn = sync.enabled && !!activeEmail;
  accountBtn.hidden = !signedIn;
  if (signedIn) accountBtn.textContent = activeEmail + ' · switch';
}

function showLogin() {
  loginOverlay.hidden = false;
  loginEmail.value = '';
  loginEmail.focus();
}

function hideLogin() {
  loginOverlay.hidden = true;
}

function startApp() {
  loadLocal();
  applyState();
  updateAccountButton();

  if (sync.enabled && activeEmail) {
    note('Syncing…');
    pullRemote()
      .then((remote) => {
        // Firestore is the source of truth on load; local is the offline cache.
        replaceState(remote);
        applyState();
        saveLocal();
        note('Synced as ' + activeEmail);
      })
      .catch((err) => {
        console.error('Firestore pull failed:', err);
        note('Offline — using progress saved in this browser.', true);
      });
  } else {
    note(idleNote());
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = loginEmail.value.trim().toLowerCase();
  if (!email) return;
  activeEmail = email;
  writeEmail(email);
  hideLogin();
  startApp();
});

accountBtn.addEventListener('click', () => {
  forgetEmail();
  activeEmail = '';
  showLogin();
});

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

setTheme(readTheme());

if (sync.enabled) {
  activeEmail = readEmail();
  if (activeEmail) startApp();
  else showLogin();
} else {
  startApp();
}
