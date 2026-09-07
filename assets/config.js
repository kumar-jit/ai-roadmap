/* Optional cross-device sync.
 *
 * Leave `sync.enabled` false and the tracker is a pure static site: progress
 * lives in this browser's localStorage and Export/Import moves it around.
 *
 * Set it to true (and point `baseUrl` at a deployment of ./server) and the page
 * also pushes progress to that service, so a phone and a laptop stay in step.
 *
 * `token` is a shared secret, not real auth. It goes in the client bundle, so
 * anyone who can load the page can read it. Fine for a personal tracker on a
 * private URL; do not put anything sensitive behind it.
 */
export const CONFIG = {
  sync: {
    enabled: false,
    baseUrl: 'http://localhost:8000',
    userId: 'me',
    token: 'change-me',
  },
};
