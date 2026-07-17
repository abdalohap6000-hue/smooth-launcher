// ─────────────────────────────────────────────────────────────────────────────
// savedPostsService.js — localStorage-based replacement for Base44 entities
// Swap this with your own DB/API if you have a backend.
// ─────────────────────────────────────────────────────────────────────────────

const KEY = 'qalami_saved_posts';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}
function save(posts) { localStorage.setItem(KEY, JSON.stringify(posts)); }

export const SavedPost = {
  list: (sortKey = '-created_date', limit = 50) => {
    let posts = load();
    if (sortKey.startsWith('-')) posts = posts.slice().reverse();
    return Promise.resolve(posts.slice(0, limit));
  },
  create: (data) => {
    const posts = load();
    const record = { ...data, id: crypto.randomUUID(), created_date: new Date().toISOString() };
    posts.push(record);
    save(posts);
    return Promise.resolve(record);
  },
  delete: (id) => {
    const posts = load().filter(p => p.id !== id);
    save(posts);
    return Promise.resolve();
  },
};