/* Zero to Your Own Model — roadmap tracker.
 *
 * No framework, no build step. Renders the curriculum from roadmap.data.js
 * as a node graph (root -> stage -> group -> item), keeps progress in
 * localStorage, and optionally mirrors it to Firestore.
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

function replaceState(next) {
  for (const k in state) delete state[k];
  Object.assign(state, next || {});
}

/* ------------------------------------------------------------------ *
 * Tree model — root -> stage -> group -> item (leaf, checkable).
 * Built once from ROADMAP; `collapsed` is the only thing that changes
 * afterward (plus `state`, which lives separately by item id).
 * ------------------------------------------------------------------ */

/** Flat list of every leaf item, for search/progress/export. */
const ITEMS = [];

/** Flat list of every stage node, for the collapse-all sweep. */
const STAGES = [];

function buildTree() {
  const root = {
    type: 'root', id: 'root', name: 'Zero to Your Own Model',
    parent: null, children: [],
  };

  ROADMAP.forEach((stage, si) => {
    const total = stage.g.reduce((n, g) => n + g.i.length, 0);
    const stageNode = {
      type: 'stage', id: 'stage-' + si, si, stage, total,
      name: stage.no + ' · ' + stage.t,
      collapsed: true, parent: root, children: [],
    };
    STAGES.push(stageNode);

    stage.g.forEach((group, gi) => {
      const groupNode = {
        type: 'group', id: 'group-' + si + '-' + gi, si, gi, group,
        name: group.t,
        collapsed: true, parent: stageNode, children: [],
      };

      group.i.forEach((item, ii) => {
        const itemId = 's' + si + '.' + gi + '.' + ii;
        const itemNode = {
          type: 'item', id: 'item-' + itemId, itemId, si, gi, ii,
          name: item.n, why: item.w || '', milestone: !!item.m,
          // Only what the node itself represents, so a search hit is explainable.
          text: (item.n + ' ' + (item.w || '')).toLowerCase(),
          parent: groupNode, children: [],
        };
        ITEMS.push(itemNode);
        groupNode.children.push(itemNode);
      });

      stageNode.children.push(groupNode);
    });

    root.children.push(stageNode);
  });

  return root;
}

const root = buildTree();
const TOTAL = ITEMS.length;

/** Every stage/group/item, by id — so a note's @mention can find (and jump
 * to) any topic regardless of what's currently expanded. */
const NODE_BY_ID = new Map();
(function indexNodes(node) {
  if (node.type !== 'root') NODE_BY_ID.set(node.id, node);
  node.children.forEach(indexNodes);
})(root);

/** Flat, searchable list of everything a note can @mention. */
const MENTIONABLE = [...NODE_BY_ID.values()].map((n) => ({ id: n.id, name: n.name }));

/* ------------------------------------------------------------------ *
 * Layout — a simple tidy-tree: each visible leaf row gets the next slot
 * top to bottom; a parent sits at the midpoint of its visible children.
 * Recomputed on every structural change (expand/collapse, search, hide-done).
 * ------------------------------------------------------------------ */

const COL_W = 300; // px between successive depths
const NODE_W = 250; // reserved width per node, for where an edge starts
const ROW_H = 46;   // px per leaf row

let searchTerm = '';
let hideDoneOn = false;

function ownMatch(node) {
  return !!searchTerm && node.name.toLowerCase().includes(searchTerm);
}

/** Whether this node or anything under it matches the current search. */
function nodeMatches(node) {
  if (!searchTerm) return true;
  if (node.type === 'item') return node.text.includes(searchTerm);
  return ownMatch(node) || node.children.some(nodeMatches);
}

function visibleChildren(node) {
  let kids = node.children;
  if (searchTerm) kids = kids.filter(nodeMatches);
  if (hideDoneOn) kids = kids.filter((c) => c.type !== 'item' || !state[c.itemId]);
  return kids;
}

/** A search in progress forces every matching branch open, so results are
 * never hidden behind a manually-collapsed box. */
function isOpen(node) {
  if (searchTerm) return true;
  return !node.collapsed;
}

/** Rebuilt on every layout(): the nodes actually placed, in draw order,
 * each paired with its parent (for edges) — or null for the root. */
let placed = [];

function layout() {
  placed = [];
  let row = 0;

  function place(node, depth, parent) {
    node.depth = depth;
    node.x = depth * COL_W;
    placed.push({ node, parent });

    const kids = node.type === 'root' || isOpen(node) ? visibleChildren(node) : [];
    if (kids.length === 0) {
      node.y = row * ROW_H;
      row += 1;
      return;
    }
    kids.forEach((k) => place(k, depth + 1, node));
    node.y = (kids[0].y + kids[kids.length - 1].y) / 2;
  }

  place(root, 0, null);
  return row;
}

/* ------------------------------------------------------------------ *
 * Render
 * ------------------------------------------------------------------ */

const edgesSvg = document.getElementById('graphEdges');
const nodesEl = document.getElementById('graphNodes');

/** node.id -> its current DOM element, so a plain checkbox toggle can patch
 * in place instead of tearing down the whole graph. */
const nodeEls = new Map();

function countDone(node) {
  let n = 0;
  (function walk(x) {
    if (x.type === 'item') { if (state[x.itemId]) n++; return; }
    x.children.forEach(walk);
  })(node);
  return n;
}

/**
 * Rewrite `target`'s text with every occurrence of `term` wrapped in <mark>.
 * Built from text nodes rather than innerHTML, so curriculum text containing
 * angle brackets can never become markup.
 */
function highlight(target, text, term) {
  target.textContent = '';
  const haystack = text.toLowerCase();
  let from = 0;
  let at = haystack.indexOf(term);

  while (at !== -1) {
    if (at > from) target.appendChild(document.createTextNode(text.slice(from, at)));
    const mark = document.createElement('mark');
    mark.textContent = text.slice(at, at + term.length);
    target.appendChild(mark);
    from = at + term.length;
    at = haystack.indexOf(term, from);
  }
  if (from < text.length) target.appendChild(document.createTextNode(text.slice(from)));
}

function renderItemNode(node) {
  const box = document.createElement('div');
  box.className = 'gnode g-item'
    + (node.milestone ? ' ms' : '')
    + (state[node.itemId] ? ' done' : '')
    + (ownMatch(node) ? ' hit' : '');
  box.style.left = node.x + 'px';
  box.style.top = node.y + 'px';

  const cbId = 'cb-' + node.itemId;
  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.id = cbId;
  cb.checked = !!state[node.itemId];
  cb.addEventListener('change', () => {
    if (cb.checked) state[node.itemId] = 1; else delete state[node.itemId];
    box.classList.toggle('done', cb.checked);
    updateCounts(node.parent);
    persist();
    // Hiding done items can change which rows exist, so it needs a real relayout.
    if (hideDoneOn) render();
  });

  const label = document.createElement('label');
  label.className = 'lab';
  label.htmlFor = cbId;
  if (node.why) label.title = node.why;

  const name = document.createElement('span');
  name.className = 'n';
  if (ownMatch(node)) highlight(name, node.name, searchTerm);
  else name.textContent = node.name;
  label.appendChild(name);

  box.append(cb, label);
  return box;
}

function renderBranchNode(node) {
  const open = isOpen(node);
  const total = node.type === 'stage' ? node.total : node.children.length;
  const done = countDone(node);

  const box = document.createElement('button');
  box.type = 'button';
  box.className = 'gnode g-' + node.type + (open ? ' open' : '') + (total && done === total ? ' all-done' : '');
  box.style.left = node.x + 'px';
  box.style.top = node.y + 'px';
  box.setAttribute('aria-expanded', String(open));
  if (searchTerm) box.disabled = true; // search already forces everything relevant open

  const caret = document.createElement('span');
  caret.className = 'caret';

  const name = document.createElement('span');
  name.className = 'gname';
  if (ownMatch(node)) highlight(name, node.name, searchTerm);
  else name.textContent = node.name;

  const count = document.createElement('span');
  count.className = 'gcount';
  count.textContent = done + '/' + total;

  box.append(caret, name, count);

  box.addEventListener('click', () => {
    node.collapsed = !node.collapsed;
    render();
    const fresh = nodeEls.get(node.id);
    if (fresh) fresh.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  });

  return box;
}

function renderRootNode(node) {
  const box = document.createElement('div');
  box.className = 'gnode g-root';
  box.style.left = node.x + 'px';
  box.style.top = node.y + 'px';
  box.textContent = node.name;
  return box;
}

function updateCounts(node) {
  while (node && node.type !== 'root') {
    const box = nodeEls.get(node.id);
    if (box) {
      const total = node.type === 'stage' ? node.total : node.children.length;
      const done = countDone(node);
      box.querySelector('.gcount').textContent = done + '/' + total;
      box.classList.toggle('all-done', total > 0 && done === total);
    }
    node = node.parent;
  }
}

function render() {
  const rows = layout();
  const maxDepth = placed.reduce((m, { node }) => Math.max(m, node.depth), 0);

  const width = (maxDepth + 1) * COL_W + NODE_W + 40;
  const height = Math.max(rows * ROW_H, ROW_H);
  edgesSvg.setAttribute('width', String(width));
  edgesSvg.setAttribute('height', String(height));
  nodesEl.style.width = width + 'px';
  nodesEl.style.height = height + 'px';

  let edgeHTML = '';
  for (const { node, parent } of placed) {
    if (!parent) continue;
    const x1 = parent.x + NODE_W, y1 = parent.y + ROW_H / 2;
    const x2 = node.x, y2 = node.y + ROW_H / 2;
    const mx = (x1 + x2) / 2;
    const hit = node.type === 'item' && ownMatch(node);
    edgeHTML += '<path d="M' + x1 + ',' + y1 + ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2 + '"'
      + (hit ? ' class="hit"' : '') + '/>';
  }
  edgesSvg.innerHTML = edgeHTML;

  nodesEl.innerHTML = '';
  nodeEls.clear();
  for (const { node } of placed) {
    const box = node.type === 'root' ? renderRootNode(node)
      : node.type === 'item' ? renderItemNode(node)
      : renderBranchNode(node);
    nodeEls.set(node.id, box);
    nodesEl.appendChild(box);
  }

  refresh();
}

/* ------------------------------------------------------------------ *
 * Progress meter (top bar / header / footer)
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
  for (const item of ITEMS) if (state[item.itemId]) done++;

  const pct = TOTAL ? Math.round((done / TOTAL) * 100) : 0;
  el.fill.style.width = pct + '%';
  el.num.textContent = done + ' / ' + TOTAL;
  el.hdrProgress.firstChild.nodeValue = done + ' / ' + TOTAL;
  el.hdrPct.textContent = pct + '% complete';
  el.footprog.textContent = done + ' / ' + TOTAL + ' complete';
}

/** Rebuild the whole graph from `state` — used after loading, importing, or
 * a remote sync, since those can touch items that aren't currently rendered. */
function applyState() {
  render();
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
 * Sticky notes — freeform, per account, same sync model as progress.
 * Plain text only; @mention a topic to link straight to it in the graph.
 * A mention is stored inline as `@[Name](node-id)` and rendered as a
 * clickable chip whenever the note isn't being edited.
 * ------------------------------------------------------------------ */

const NOTES_KEY = 'zttym-notes-v1';
const NOTE_COLORS = ['yellow', 'pink', 'green', 'blue', 'orange', 'purple'];
const MENTION_RE = /@\[([^\]]+)\]\(([^)]+)\)/g;

let notesList = []; // [{ id, title, body, color, updatedAt }]

function notesLocalKey() {
  return activeEmail ? NOTES_KEY + ':' + activeEmail : NOTES_KEY;
}

function loadNotesLocal() {
  try {
    const raw = localStorage.getItem(notesLocalKey());
    notesList = raw ? JSON.parse(raw) : [];
  } catch (err) {
    notesList = [];
  }
}

function saveNotesLocal() {
  try { localStorage.setItem(notesLocalKey(), JSON.stringify(notesList)); } catch (err) { /* not fatal */ }
}

let notesSyncTimer = null;

async function notesRef() {
  const { db, doc } = await ensureFirestore();
  return doc(db, 'notes', activeEmail);
}

async function pullNotesRemote() {
  const { getDoc } = await ensureFirestore();
  const snap = await getDoc(await notesRef());
  return snap.exists() ? (snap.data().items || []) : [];
}

function pushNotesRemote() {
  clearTimeout(notesSyncTimer);
  notesSyncTimer = setTimeout(async () => {
    try {
      const { setDoc } = await ensureFirestore();
      await setDoc(await notesRef(), { items: notesList });
    } catch (err) {
      console.error('Firestore notes push failed:', err);
    }
  }, 600);
}

function persistNotes() {
  saveNotesLocal();
  if (sync.enabled && activeEmail) pushNotesRemote();
}

function newNoteId() {
  return 'note-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function touchNote(n) {
  n.updatedAt = new Date().toISOString();
  persistNotes();
}

function formatNoteDate(iso) {
  const d = new Date(iso);
  const sameDay = d.toDateString() === new Date().toDateString();
  return sameDay
    ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

/** Expand every ancestor of `id`, drop any active search, then scroll the
 * node into view and flash it — used when a note's @mention is clicked. */
function goToTopic(id) {
  const target = NODE_BY_ID.get(id);
  if (!target) return;
  for (let n = target.parent; n && n.type !== 'root'; n = n.parent) n.collapsed = false;
  searchTerm = '';
  search.value = '';
  render();
  note(idleNote());
  const box = nodeEls.get(id);
  if (box) {
    box.scrollIntoView({ block: 'center', inline: 'center' });
    box.classList.add('flash');
    setTimeout(() => box.classList.remove('flash'), 1200);
  }
}

function renderNoteBody(container, text) {
  container.textContent = '';
  let from = 0;
  let m;
  MENTION_RE.lastIndex = 0;
  while ((m = MENTION_RE.exec(text))) {
    if (m.index > from) container.appendChild(document.createTextNode(text.slice(from, m.index)));
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'mention';
    chip.textContent = '@' + m[1];
    const topicId = m[2];
    chip.addEventListener('click', () => goToTopic(topicId));
    container.appendChild(chip);
    from = m.index + m[0].length;
  }
  if (from < text.length) container.appendChild(document.createTextNode(text.slice(from)));
}

let openSuggestBox = null;

function closeSuggest() {
  if (openSuggestBox) { openSuggestBox.remove(); openSuggestBox = null; }
}

/** A small dropdown of matching topics, anchored to the note card, shown
 * while typing `@something` in a note body. */
function showSuggest(anchorEl, query, onPick) {
  closeSuggest();
  const q = query.toLowerCase();
  const matches = MENTIONABLE.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 8);
  if (!matches.length) return;

  const box = document.createElement('div');
  box.className = 'mention-suggest';
  matches.forEach((m) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'mention-suggest-item';
    item.textContent = m.name;
    // mousedown (not click) fires before the textarea blurs, so focus never
    // leaves it and the insert below lands at the right cursor position.
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      onPick(m);
      closeSuggest();
    });
    box.appendChild(item);
  });
  anchorEl.appendChild(box);
  openSuggestBox = box;
}

const notesListEl = document.getElementById('notesList');
const addNoteBtn = document.getElementById('addNote');

function renderNoteCard(n) {
  const card = document.createElement('div');
  card.className = 'note c-' + n.color;

  const titleRow = document.createElement('div');
  titleRow.className = 'note-title-row';

  const title = document.createElement('input');
  title.className = 'note-title';
  title.value = n.title;
  title.placeholder = 'Title';
  title.addEventListener('input', () => { n.title = title.value; });
  title.addEventListener('blur', () => touchNote(n));

  const date = document.createElement('span');
  date.className = 'note-date';
  date.textContent = formatNoteDate(n.updatedAt);

  const del = document.createElement('button');
  del.type = 'button';
  del.className = 'note-del';
  del.textContent = '×';
  del.title = 'Delete note';
  del.addEventListener('click', () => {
    if (confirm('Delete this note?')) {
      notesList = notesList.filter((x) => x.id !== n.id);
      persistNotes();
      renderNotes();
    }
  });

  titleRow.append(title, date, del);

  const view = document.createElement('div');
  view.className = 'note-view';
  const showPlaceholder = () => {
    if (n.body) { view.classList.remove('empty'); renderNoteBody(view, n.body); }
    else { view.classList.add('empty'); view.textContent = 'Type @ to link a topic…'; }
  };
  showPlaceholder();

  const body = document.createElement('textarea');
  body.className = 'note-body';
  body.value = n.body;
  body.hidden = true;
  body.rows = 3;

  view.addEventListener('click', (e) => {
    if (e.target.closest('.mention')) return; // let the chip navigate instead of entering edit mode
    view.hidden = true;
    body.hidden = false;
    body.focus();
  });

  body.addEventListener('input', () => {
    n.body = body.value;
    const before = body.value.slice(0, body.selectionStart);
    const m = before.match(/@([^\s@[\]()]*)$/);
    if (!m) { closeSuggest(); return; }
    showSuggest(card, m[1], (picked) => {
      const start = body.selectionStart - m[0].length;
      const insert = '@[' + picked.name + '](' + picked.id + ') ';
      body.value = body.value.slice(0, start) + insert + body.value.slice(body.selectionStart);
      n.body = body.value;
      const pos = start + insert.length;
      body.focus();
      body.setSelectionRange(pos, pos);
      touchNote(n);
    });
  });
  body.addEventListener('blur', () => {
    closeSuggest();
    touchNote(n);
    body.hidden = true;
    view.hidden = false;
    showPlaceholder();
  });
  body.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { closeSuggest(); body.blur(); }
  });

  const colors = document.createElement('div');
  colors.className = 'note-colors';
  NOTE_COLORS.forEach((c) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'note-color-dot c-' + c + (c === n.color ? ' active' : '');
    dot.title = c;
    dot.addEventListener('click', () => { n.color = c; touchNote(n); renderNotes(); });
    colors.appendChild(dot);
  });

  card.append(titleRow, view, body, colors);
  return card;
}

function renderNotes() {
  notesListEl.innerHTML = '';
  for (const n of notesList) notesListEl.appendChild(renderNoteCard(n));
}

addNoteBtn.addEventListener('click', () => {
  if (notesCollapsed()) setNotesOpen(true);
  const used = notesList.map((n) => n.color);
  const color = NOTE_COLORS.find((c) => !used.includes(c)) || NOTE_COLORS[notesList.length % NOTE_COLORS.length];
  notesList.unshift({ id: newNoteId(), title: '', body: '', color, updatedAt: new Date().toISOString() });
  persistNotes();
  renderNotes();
  const firstTitle = notesListEl.querySelector('.note .note-title');
  if (firstTitle) firstTitle.focus();
});

/* ------------------------------------------------------------------ *
 * Folding the board away
 *
 * The rail is fixed to the viewport and .wrap reserves its width, so both
 * sides move together off one class on <html>. index.html stamps the same
 * class before first paint to avoid a visible slide on load.
 * ------------------------------------------------------------------ */

const NOTES_OPEN_KEY = 'zttym-notes-open';
const notesTab = document.getElementById('notesTab');
const notesHideBtn = document.getElementById('notesHide');

function notesCollapsed() {
  return document.documentElement.classList.contains('notes-collapsed');
}

function setNotesOpen(open) {
  document.documentElement.classList.toggle('notes-collapsed', !open);
  notesTab.hidden = open;
  notesTab.setAttribute('aria-expanded', String(open));
  try { localStorage.setItem(NOTES_OPEN_KEY, open ? '1' : '0'); } catch (err) { /* not fatal */ }
}

notesHideBtn.addEventListener('click', () => {
  setNotesOpen(false);
  notesTab.focus();
});

notesTab.addEventListener('click', () => {
  setNotesOpen(true);
  addNoteBtn.focus();
});

// Reflect whatever the boot script decided, without writing it back.
notesTab.hidden = !notesCollapsed();
notesTab.setAttribute('aria-expanded', String(!notesCollapsed()));

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

function clearSearch() {
  searchTerm = '';
  search.value = '';
  render();
  note(idleNote());
}

search.addEventListener('input', () => {
  searchTerm = search.value.trim().toLowerCase();
  if (!searchTerm) { clearSearch(); return; }

  render();
  const hits = ITEMS.filter((item) => item.text.includes(searchTerm)).length;
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
    clearSearch();
    search.blur();
  }
});

const hideDoneBtn = document.getElementById('toggleDone');
hideDoneBtn.addEventListener('click', () => {
  hideDoneOn = hideDoneBtn.getAttribute('aria-pressed') !== 'true';
  hideDoneBtn.setAttribute('aria-pressed', String(hideDoneOn));
  hideDoneBtn.textContent = hideDoneOn ? 'Show done' : 'Hide done';
  render();
});

const collapseAllBtn = document.getElementById('collapseAll');
collapseAllBtn.addEventListener('click', () => {
  const anyOpen = STAGES.some((s) => !s.collapsed || s.children.some((g) => !g.collapsed));
  STAGES.forEach((s) => {
    s.collapsed = anyOpen;
    s.children.forEach((g) => { g.collapsed = anyOpen; });
  });
  collapseAllBtn.textContent = anyOpen ? 'Expand all' : 'Collapse all';
  render();
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

  loadNotesLocal();
  renderNotes();

  if (sync.enabled && activeEmail) {
    note('Syncing…');
    Promise.all([pullRemote(), pullNotesRemote()])
      .then(([remoteProgress, remoteNotes]) => {
        // Firestore is the source of truth on load; local is the offline cache.
        replaceState(remoteProgress);
        applyState();
        saveLocal();
        notesList = remoteNotes;
        saveNotesLocal();
        renderNotes();
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
