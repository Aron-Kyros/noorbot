// src/session.js
// Baileys' useMultiFileAuthState already persists auth_info/ to disk on every
// creds update — no external DB is needed. On Railway, mount a Volume at the
// path AUTH_DIR points to (see .env / railway.json) so auth_info/ survives
// redeploys and restarts.

import { promises as fs } from 'fs';

const AUTH_DIR = process.env.AUTH_DIR || './auth_info';

// Ensure the auth directory exists before Baileys reads/writes to it.
export async function restoreSession() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    const files = await fs.readdir(AUTH_DIR);
    const restored = files.length > 0;
    if (restored) console.log(`✅ Found existing session (${files.length} files) in ${AUTH_DIR}`);
    return restored;
  } catch (err) {
    console.error('Session restore error:', err.message);
    return false;
  }
}

// No-op: useMultiFileAuthState's saveCreds() already writes straight to disk.
// Kept as a function so index.js doesn't need to change its call sites.
export async function saveSession() {
  // Intentionally empty — disk write already happened via saveCreds().
}

// Wipe the auth directory (e.g. after a logout) so the bot re-pairs on restart.
export async function clearSession() {
  try {
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
    console.log('🗑️ Session cleared');
  } catch (err) {
    console.error('Session clear error:', err.message);
  }
}