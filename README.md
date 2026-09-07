# Zero to Your Own Model

A learning tracker for going from complete beginner to building, training, aligning and serving your own language model. 290 checkpoints across ten stages, laid out as a dependency tree, with progress you can tick off.

No framework, no build step, no `node_modules`. It is HTML, CSS and three JavaScript files — push it to GitHub Pages and it works.

![stages 00–09, 290 topics, 11 milestones](https://img.shields.io/badge/stages-10-0F548E) ![topics](https://img.shields.io/badge/topics-290-0F548E) ![milestones](https://img.shields.io/badge/milestones-11-0F548E)

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
│   ├── config.js               optional sync settings
│   └── styles.css              design tokens and layout
├── server/                     OPTIONAL cross-device sync
│   ├── main.py                 FastAPI + SQLite, ~150 lines
│   ├── test_main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml          optional, for the sync server
└── .github/workflows/
    ├── deploy-pages.yml        publishes the site on push to main
    └── test-server.yml         runs the server tests
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

## Optional: sync across devices

Skip this unless you actually want your phone and laptop to stay in step. The tracker is complete without it.

```bash
# Generate a token
export ROADMAP_TOKEN=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")

# Run it
docker compose up -d          # or: cd server && pip install -r requirements.txt && uvicorn main:app
```

Then in `assets/config.js`:

```js
export const CONFIG = {
  sync: {
    enabled: true,
    baseUrl: 'https://your-sync-host.example.com',
    userId:  'me',
    token:   'the-token-you-generated',
  },
};
```

On load the server wins; every change is pushed back, debounced. If the server is unreachable the page falls back to `localStorage` and says so — you never lose a tick because a container was down.

**API**

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness. |
| `GET` | `/progress/{user_id}` | Returns `{done, updated_at, count}`. An unknown user is empty, not a 404. |
| `PUT` | `/progress/{user_id}` | Body `{"done": {"s0.0.0": 1}}`. Keys that do not match the item-id pattern are dropped. |

All routes except `/health` require an `X-Token` header.

**Be honest about what this auth is.** One shared token, compared in constant time, that ships inside the client bundle. It stops strangers scribbling on your checkboxes. It is not real authentication, and this service should not hold anything you would mind leaking. If you deploy it publicly, put it behind HTTPS and set `ROADMAP_ORIGINS` to your Pages URL rather than leaving it `*`.

Tests:

```bash
pip install -r server/requirements.txt pytest httpx
ROADMAP_TOKEN=test pytest server/test_main.py -q
```

---

## Other ways to host it

Any static host works, since there is no build:

- **Netlify / Vercel / Cloudflare Pages** — connect the repo, leave the build command blank, publish directory `.`
- **Your own box** — `python3 -m http.server`, or drop the files in nginx's web root
- **Nothing at all** — clone it and run the local server; it works entirely offline apart from the web fonts

---

## Licence

MIT. Fork it, rewrite the curriculum, use it for something else entirely.
