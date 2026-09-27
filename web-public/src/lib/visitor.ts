import api from "./api";

// Mints (or refreshes) the horilux_visitor cookie once per app load.
// Idempotent on the backend: an existing valid cookie is just refreshed.
let mintPromise: Promise<void> | null = null;

export function ensureVisitor(): Promise<void> {
  if (!mintPromise) {
    mintPromise = api
      .post("/public/visitor/")
      .then(() => undefined)
      .catch(() => {
        mintPromise = null; // allow a retry on the next call if this failed
      });
  }
  return mintPromise;
}
