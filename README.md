# Zero to Your Own Model

A learning tracker for going from complete beginner to building, training, aligning and serving your own language model. 290 checkpoints across ten stages, laid out as a dependency tree, with progress you can tick off.

No framework, no build step, no `node_modules`. It is HTML, CSS and three JavaScript files — push it to GitHub Pages and it works.

![stages 00–09, 290 topics, 11 milestones](https://img.shields.io/badge/stages-10-0F548E) ![topics](https://img.shields.io/badge/topics-290-0F548E) ![milestones](https://img.shields.io/badge/milestones-11-0F548E)

**Live:** [kumar-jit.github.io/ai-roadmap](https://kumar-jit.github.io/ai-roadmap/)

---

## Deploy it in three minutes

```bash
# 1. Make a repo on GitHub, then:
git init
git add .
git commit -m "Add roadmap tracker"
git branch -M main
git remote add origin git@github.com:<you>/<repo>.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source → GitHub Actions**.

The included workflow publishes on every push to `main`. Your tracker lands at `https://<you>.github.io/<repo>/`.

To run it locally first:

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

It must be served over HTTP, not opened as a `file://` path — the app uses ES modules, and browsers block those on `file://`.

---

## What you get

| | |
|---|---|
| **The tree** | Stage → topic group → the individual point you have to know, each with a line on *why it earns its place*. |
| **Progress** | Every leaf is a checkbox. Saved to `localStorage` immediately. Per-group, per-stage and overall meters update live. |
| **Milestones** | Eleven dashed boxes — the things you have to actually build. Ticking topics is not the same as passing these. |
| **Search** | Press `/` from anywhere. Filters all 290 topics; `Esc` clears. |
| **Export / import** | Progress as a JSON file, so you can back it up, commit it, or move to another machine. |
| **Theme** | System, light or dark. Remembered. |
| **Print** | The stylesheet drops the chrome and avoids breaking stages across pages. |

---

## Layout

```
.
├── index.html                  the page shell
├── assets/
│   ├── roadmap.data.js         the curriculum — edit this to change content
│   ├── app.js                  rendering, progress, search, persistence
│   ├── config.js               optional sync settings (Firebase config)
│   └── styles.css              design tokens and layout
└── .github/workflows/
    └── deploy-pages.yml        publishes the site on push to main
```

---

## Editing the roadmap

Everything you see comes from `assets/roadmap.data.js`. Nothing else needs touching.

```js
{
  no: "04",                                  // shown in the badge and item ids
  t:  "Transformers and LLM internals",
  wk: "Weeks 36–52",
  hrs:"~230 h",
  sub:"One-line description under the title.",
  out:"What you can do when this stage is finished.",
  g: [                                       // topic groups
    {
      t: "Attention",
      i: [                                   // the checkable leaves
        { n: "Scaled dot-product attention, and why √d",
          w: "Without the scale, softmax saturates and gradients vanish." },

        { n: "Pretrain a 10–50 M parameter GPT on your own GPU",
          w: "Your tokeniser, your model, your training loop.",
          m: true }                          // m: true → milestone box
      ]
    }
  ]
}
```

`n` is the name, `w` is the *why*, `m` marks a milestone.

**One thing to know before you reorder anything.** Progress ids are positional — `s4.1.2` means stage 4, group 1, item 2. Adding items at the *end* of a group is safe. Inserting or reordering shifts the ids of everything after the insertion point, and your ticks will land on the wrong rows. If you need to restructure, export your progress first, make the change, and edit the JSON keys before importing.

---

## Optional: sync across devices, per account

Skip this unless you actually want progress tied to an account and following you between devices. The tracker is complete without it, and this needs no server of your own — just a free Firebase project. GitHub Pages stays 100% static either way.

**One-time setup (a few minutes, no credit card):**

1. [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (Google Analytics is not needed — you can skip it).
2. **Build → Firestore Database → Create database.** Pick any region; start in production mode (the rules below lock it down).
3. **Project settings → General → Your apps → Add app → Web** (the `</>` icon). Register it — you don't need Firebase Hosting, just the SDK config it shows you.
4. `assets/config.js` stays a placeholder in the repo — real values never get committed. Instead, in the GitHub repo: **Settings → Secrets and variables → Actions**.
   - Under **Secrets**, add `FIREBASE_API_KEY`.
   - Under **Variables**, add `FIREBASE_PROJECT_ID`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_MESSAGING_SENDER_ID`, `FIREBASE_APP_ID` — one value from `firebaseConfig` each.

   The deploy workflow (`.github/workflows/deploy-pages.yml`) writes them into `assets/config.js` at deploy time, with `sync.enabled = true`, so the live site has real values while the repo never does.
5. **Firestore Database → Rules**, replace the contents with:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /progress/{email} {
         allow read, write: if email.matches('^[^@\\s]+@[^@\\s]+[.][^@\\s]+$');
       }
     }
   }
   ```

   then **Publish**.

Push to GitHub Pages as usual — no server to deploy, no Docker, nothing else to host. If the secrets/variables above aren't set, the deploy step is skipped and the site simply ships with sync off, same as running it fresh.

**Testing locally**, before any of this exists in CI, temporarily paste real values straight into `assets/config.js` and set `enabled: true`, then `git checkout -- assets/config.js` afterwards so they never get committed.

With sync on, the page asks for an email before showing the tracker — **no password**. Typing an email is what makes it "your" account; there's an account switcher (top bar) to sign out and sign in as someone else on the same browser. On load Firestore wins; every change is pushed back, debounced. If it's unreachable the page falls back to `localStorage` and says so — you never lose a tick because your connection dropped.

**Storage.** Collection `progress`, one document per email, and the document *is* the done map — `{ "s0.0.0": true, "s1.2.3": true, ... }`. Free "Spark" tier covers 1 GiB and 50k reads / 20k writes a day, far more than a personal tracker needs.

**Be honest about what this auth is.** There isn't any — an email is a label, not a credential, and anyone who knows (or guesses) an address, or opens devtools, can read or overwrite that account's ticks. The Firestore rule above only checks that the document id looks like an email; it does not verify who is typing it. `firebaseConfig` itself is not a secret in the security sense — it's still visible to anyone who views source on the live site, same as every Firebase web app. Keeping it out of the git repo (step 4) only avoids bots that scrape public repos for exposed Firebase projects to spam; it isn't what makes this secure. Fine for a personal tracker or a small trusted group; do not put anything sensitive behind it.

---

## Other ways to host it

Any static host works, since there is no build:

- **Netlify / Vercel / Cloudflare Pages** — connect the repo, leave the build command blank, publish directory `.`
- **Your own box** — `python3 -m http.server`, or drop the files in nginx's web root
- **Nothing at all** — clone it and open it locally; it works entirely offline apart from the web fonts and, if enabled, Firestore sync

---

## Licence

MIT. Fork it, rewrite the curriculum, use it for something else entirely.
