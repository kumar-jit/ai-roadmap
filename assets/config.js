/* Optional cross-device sync, tied to an email login, backed by Firebase
 * Firestore (https://console.firebase.google.com — free "Spark" plan, no
 * credit card, no server to host).
 *
 * Leave `sync.enabled` false and the tracker is a pure static site: progress
 * lives in this browser's localStorage and Export/Import moves it around.
 *
 * This file is a placeholder. The real firebaseConfig values live as GitHub
 * Actions secrets and are written into this file by .github/workflows/deploy-
 * pages.yml at deploy time — they are never committed to the repo. See the
 * README ("Optional: sync across devices") for the one-time setup: create
 * the Firebase project, add the repo secrets, set the Firestore rule.
 *
 * For local testing, temporarily paste real values into the object below,
 * try it, then revert this file before committing (`git checkout -- assets/
 * config.js`) so the real values never end up in git history.
 *
 * There is no password — anyone who types an email address "is" that
 * account. `firebaseConfig` is not a secret in the security sense; it ships
 * in the client bundle the same way it does in every Firebase web app. What
 * actually gates access is the Firestore Security Rules you set in the
 * Firebase console, and this project's rule only checks that the id looks
 * like an email — it does not verify who is typing it. Keeping the values
 * out of the repo just avoids bots that scrape public GitHub repos for
 * exposed Firebase projects to spam; it is not what makes this secure.
 * Fine for a personal tracker or a small trusted group; do not put anything
 * sensitive behind it.
 */
export const CONFIG = {
  sync: {
    enabled: false,
    firebaseConfig: {
      apiKey: 'change-me',
      authDomain: 'your-project.firebaseapp.com',
      projectId: 'your-project',
      storageBucket: 'your-project.appspot.com',
      messagingSenderId: 'change-me',
      appId: 'change-me',
    },
  },
};
