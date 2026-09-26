// src/index.js — NoorBot Islamic WhatsApp Bot
// Hosting: Railway | Keep-alive: UptimeRobot | Session: disk (Railway Volume)

import 'dotenv/config';
import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import pino from 'pino';

import { restoreSession, clearSession } from './session.js';
import { startServer } from './server.js';
import { handleCommand } from './handlers/commands.js';

const logger = pino({ level: 'silent' });
const PREFIX = process.env.BOT_PREFIX ?? '!';
const BOT_NUMBER = '2349021096681'; // ← Change this to your WhatsApp number



// ─── Cooldown (anti-spam) ─────────────────────────────────────────────────────
const cooldowns = new Map();
const COOLDOWN_MS = 3000;
function isOnCooldown(jid) {
  const last = cooldowns.get(jid);
  return last && Date.now() - last < COOLDOWN_MS;
}

// ─── Welcome messages (randomised) ───────────────────────────────────────────
const WELCOME_MESSAGES = [
  (name, group) => `اَلسَّلاَمُ عَلَيْكُمْ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ 🌙\n\nMarhaban ya ${name}! Welcome to *${group}*. May Allah bless your presence here and make this a source of knowledge and brotherhood for you. We're glad to have you! 🤲`,
  (name, group) => `وعليكم السلام ورحمة الله وبركاته ✨\n\nJazakallahu Khairan for joining *${group}*, ${name}! May your time here be filled with beneficial knowledge, sincere brotherhood, and the remembrance of Allah. Welcome, akhi/ukhti! 🌿`,
  (name, group) => `🌟 *Ahlan wa Sahlan, ${name}!*\n\nWelcome to *${group}*! The Prophet ﷺ said: _"He who believes in Allah and the Last Day should honor his guest."_ — We honor your arrival. May Allah unite our hearts upon goodness. آمين`,
  (name, group) => `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ\n\n🕌 Welcome to *${group}*, ${name}! May this group be a garden of knowledge for you. Type *!help* to see what NoorBot can do for you. Glad to have you with us! 💚`,
  (name, group) => `السلام عليكم 🌙\n\n*${name}* has joined *${group}*! May Allah increase us all in knowledge and taqwa. The Prophet ﷺ said: _"When a man dies, his deeds come to an end except for three: ongoing charity, knowledge that is benefited from, or a righteous child."_ — May this be a place of beneficial knowledge for you. 📚`,
  (name, group) => `🤲 *Marhaba ${name}!*\n\nWelcome to *${group}*. We ask Allah to make your joining a blessed one, to increase the love between us, and to make this group a means of good for us all in this dunya and the akhirah. آمين يا رب العالمين 🌿`
];

// ─── Main bot ─────────────────────────────────────────────────────────────────
async function connectToWhatsApp() {
  await restoreSession();

  const { state, saveCreds } = await useMultiFileAuthState(process.env.AUTH_DIR || './auth_info');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: false,
    browser: ['NoorBot', 'Chrome', '1.0.0'],
    getMessage: async () => ({ conversation: '' })
  });

  // ─── Pair code (runs once if not registered) ─────────────────────────────────
  if (!state.creds.registered) {
    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(BOT_NUMBER);
        console.log('\n┌─────────────────────────────┐');
        console.log(`│  🔑 Pairing Code: ${code}  │`);
        console.log('└─────────────────────────────┘');
        console.log('\nGo to WhatsApp → Linked Devices → Link a Device → Link with phone number\n');
      } catch (err) {
        console.error('Pairing code error:', err.message);
      }
    }, 3000);
  }

  // ─── Persist creds to disk (Railway Volume) on every update ─────────────────
  sock.ev.on('creds.update', async () => {
    await saveCreds();
  });

  // ─── Connection events ───────────────────────────────────────────────────────
  sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
    if (connection === 'open') {
      console.log('✅ NoorBot connected to WhatsApp!');
      console.log(`📌 Prefix: ${PREFIX} | Type ${PREFIX}help in any chat\n`);
    }

    if (connection === 'close') {
      const code = (lastDisconnect?.error instanceof Boom)
        ? lastDisconnect.error.output?.statusCode
        : undefined;

      console.log(`🔴 Disconnected. Code: ${code}`);

      if (code === DisconnectReason.loggedOut) {
        console.log('⚠️ Logged out. Clearing session...');
        await clearSession();
        console.log('Re-run the bot to pair again.');
      } else {
        console.log('♻️ Reconnecting...');
        setTimeout(connectToWhatsApp, 3000);
      }
    }
  });

  // ─── Group member join — welcome message ─────────────────────────────────────
  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action !== 'add') return;

    try {
      const groupMeta = await sock.groupMetadata(id);
      const groupName = groupMeta.subject;

      for (const participant of participants) {
        const tag = `@${participant.split('@')[0]}`;
        const randomMsg = WELCOME_MESSAGES[Math.floor(Math.random() * WELCOME_MESSAGES.length)];
        const text = randomMsg(tag, groupName);

        await sock.sendMessage(id, {
          text,
          mentions: [participant]
        });
      }
    } catch (err) {
      console.error('Welcome message error:', err.message);
    }
  });

  // ─── Message handler ─────────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;

    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      const senderJid = msg.key.participant ?? jid;

      const text =
        msg.message?.conversation ||
        msg.message?.extendedTextMessage?.text ||
        msg.message?.imageMessage?.caption || '';

      if (!text?.trim().startsWith(PREFIX)) continue;

      if (isOnCooldown(senderJid)) continue;
      cooldowns.set(senderJid, Date.now());

      console.log(`[${new Date().toISOString()}] ${senderJid.split('@')[0]}: ${text}`);

      await sock.sendPresenceUpdate('composing', jid);

      try {
        const response = await handleCommand(text, senderJid);
        if (response) {
          const quoted = msg.key.participant ? { quoted: msg } : {};
          if (response.type === 'image' && response.image) {
            await sock.sendMessage(jid, {
              image: response.image,
              caption: response.caption,
              ...quoted
            });
          } else {
            await sock.sendMessage(jid, {
              text: typeof response === 'string' ? response : response.caption,
              ...quoted
            });
          }
        }
      } catch (err) {
        console.error('Handler error:', err.message);
        await sock.sendMessage(jid, {
          text: `⚠️ Something went wrong: ${err.message}`
        });
      }

      await sock.sendPresenceUpdate('paused', jid);
    }
  });
}

// ─── Boot ─────────────────────────────────────────────────────────────────────
console.log('');
console.log('  ┌──────────────────────────────┐');
console.log('  │  🌙 NoorBot — Islamic Bot    │');
console.log('  │  بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ  │');
console.log('  └──────────────────────────────┘');
console.log('');

startServer();
connectToWhatsApp().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});