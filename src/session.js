// src/session.js
// Persists Baileys auth_info to Replit DB so session survives restarts

import Database from '@replit/database';
import { promises as fs } from 'fs';
import path from 'path';

const db = new Database();
const AUTH_DIR = './auth_info';
const DB_PREFIX = 'wa_auth_';

// Save all files in auth_info/ to Replit DB
export async function saveSession() {
  try {
    const files = await fs.readdir(AUTH_DIR);
    for (const file of files) {
      const content = await fs.readFile(path.join(AUTH_DIR, file), 'utf-8');
      await db.set(`${DB_PREFIX}${file}`, content);
    }
  } catch (err) {
    // auth_info might not exist yet on first run — that's fine
  }
}

// Restore auth_info/ files from Replit DB before Baileys starts
export async function restoreSession() {
  try {
    await fs.mkdir(AUTH_DIR, { recursive: true });
    const keys = await db.list(DB_PREFIX);
    if (!keys || keys.length === 0) return false; // No saved session

    for (const key of keys) {
      const content = await db.get(key);
      const filename = key.replace(DB_PREFIX, '');
      await fs.writeFile(path.join(AUTH_DIR, filename), content);
    }
    console.log(`✅ Session restored from Replit DB (${keys.length} files)`);
    return true;
  } catch (err) {
    console.error('Session restore error:', err.message);
    return false;
  }
}

// Clear session from both disk and DB (use when logged out)
export async function clearSession() {
  try {
    const keys = await db.list(DB_PREFIX);
    for (const key of keys) await db.delete(key);
    await fs.rm(AUTH_DIR, { recursive: true, force: true });
    console.log('🗑️ Session cleared');
  } catch (err) {
    console.error('Session clear error:', err.message);
  }
}
