// src/handlers/commands.js

import { getAyah, searchQuran, getTafsir, randomVerse } from '../services/quran.js';
import { getHadith, searchHadiths, getNawawiHadith } from '../services/hadith.js';
import { askIslamic, clearHistory, explainHadith } from '../services/ai.js';

const P = process.env.BOT_PREFIX ?? '!';

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtAyah({ key, arabic, translation }) {
  return `📖 *Quran ${key}*\n\n${arabic}\n\n_${translation}_\n\n— Saheeh International`;
}

function fmtNawawi(h) {
  return `📚 *40 Hadith An-Nawawi — #${h.num}*\n\n_"${h.text}"_\n\n📌 *Reference:* ${h.ref}`;
}

// ─── Commands ─────────────────────────────────────────────────────────────────
export const COMMANDS = {

  help: {
    async run() {
      return [
        `🌙 *NoorBot — Islamic Assistant*`,
        `_بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ_`,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        ``,
        `📖 *Q U R A N*`,
        `┌─────────────────────`,
        `│ ${P}quran [surah]:[ayah]`,
        `│ _e.g. ${P}quran 2:255 (Ayatul Kursi)_`,
        `│`,
        `│ ${P}tafsir [surah]:[ayah]`,
        `│ _Ibn Kathir commentary_`,
        `│`,
        `│ ${P}search [keyword]`,
        `│ _Search across the full Quran_`,
        `│`,
        `│ ${P}verse`,
        `│ _Random verse of the day_`,
        `└─────────────────────`,
        ``,
        `📚 *H A D I T H*`,
        `┌─────────────────────`,
        `│ ${P}nawawi [1-42]`,
        `│ _40 Hadith An-Nawawi + AI explanation_`,
        `│`,
        `│ ${P}hadith [collection] [book] [num]`,
        `│ _e.g. ${P}hadith bukhari 1 1_`,
        `│ _bukhari • muslim • abudawud_`,
        `│ _tirmidhi • nasai • ibnmajah_`,
        `└─────────────────────`,
        ``,
        `🤖 *I S L A M I C  A I*`,
        `┌─────────────────────`,
        `│ ${P}ask [your question]`,
        `│ _Ask anything — fiqh, aqeedah,_`,
        `│ _seerah, tafsir, and more_`,
        `│ _Maliki madhab prioritised_`,
        `│`,
        `│ ${P}clear`,
        `│ _Reset conversation history_`,
        `└─────────────────────`,
        ``,
        `📿 *D A I L Y*`,
        `┌─────────────────────`,
        `│ ${P}dua [occasion]`,
        `│ _morning • evening • eating_`,
        `│ _sleeping • travel • anxiety_`,
        `│`,
        `│ ${P}names`,
        `│ _Random Name of Allah_`,
        `└─────────────────────`,
        ``,
        `━━━━━━━━━━━━━━━━━━━━━━`,
        `_والله أعلم — NoorBot always cites_`,
        `_its sources. Use knowledge wisely._`
      ].join('\n');
    }
  },

  quran: {
    async run(args) {
      if (!args[0]?.includes(':')) return `❌ Usage: ${P}quran [surah]:[ayah]\nExample: ${P}quran 2:255`;
      const [s, a] = args[0].split(':').map(Number);
      if (isNaN(s) || isNaN(a)) return '❌ Numbers only. Example: !quran 18:39';
      const verse = await getAyah(s, a);
      return fmtAyah(verse);
    }
  },

  tafsir: {
    async run(args) {
      if (!args[0]?.includes(':')) return `❌ Usage: ${P}tafsir [surah]:[ayah]`;
      const [s, a] = args[0].split(':').map(Number);
      const text = await getTafsir(s, a);
      if (!text) return '❌ Tafsir not found for that verse.';
      return `📖 *Tafsir Ibn Kathir — ${s}:${a}*\n\n${text}\n\n_Source: Tafsir Ibn Kathir (abridged)_`;
    }
  },

  search: {
    async run(args) {
      if (!args.length) return `❌ Usage: ${P}search [keyword]`;
      const q = args.join(' ');
      const results = await searchQuran(q);
      if (!results.length) return `🔍 No results for "${q}".`;
      const lines = [`🔍 *Quran Search: "${q}"*\n`];
      for (const r of results.slice(0, 4)) {
        const tr = r.translations?.[0]?.text?.replace(/<[^>]+>/g, '') ?? '';
        lines.push(`📌 *${r.verse_key}* — ${tr.slice(0, 110)}…`);
        lines.push(`_Use ${P}quran ${r.verse_key} for full verse_\n`);
      }
      return lines.join('\n');
    }
  },

  verse: {
    async run() {
      const v = await randomVerse();
      return `🌟 *Verse of the Day*\n\n${fmtAyah(v)}`;
    }
  },

  nawawi: {
    async run(args) {
      const num = parseInt(args[0]);
      if (!num || num < 1 || num > 42) return `❌ Usage: ${P}nawawi [1-42]`;
      const h = getNawawiHadith(num);
      if (!h) return '❌ Not found.';
      const explanation = await explainHadith(h.text);
      return `${fmtNawawi(h)}\n\n💡 *Explanation:*\n${explanation}`;
    }
  },

  hadith: {
    async run(args) {
      if (args.length < 3) return `❌ Usage: ${P}hadith [collection] [book] [num]\nExample: ${P}hadith bukhari 1 1`;
      const [col, book, num] = args;
      const h = await getHadith(col, book, num);
      const parts = [
        `📚 *Hadith — ${col.charAt(0).toUpperCase() + col.slice(1)}*`,
        `*Book ${book}, Hadith ${num}*\n`
      ];
      if (h.arabic) parts.push(h.arabic + '\n');
      parts.push(`_${h.english}_`);
      if (h.grade) parts.push(`\n📌 *Grade:* ${h.grade}`);
      return parts.join('\n');
    }
  },

  hsearch: {
    async run(args) {
      if (!args.length) return `❌ Usage: ${P}hsearch [keyword]`;
      const q = args.join(' ');
      const results = await searchHadiths(q);
      if (!results.length) return `🔍 No hadiths found for "${q}".`;
      const lines = [`🔍 *Hadith Search: "${q}"*\n`];
      for (const r of results.slice(0, 3)) {
        const en = r.hadith?.find(x => x.lang === 'en');
        if (en) lines.push(`📌 ${en.body.slice(0, 160)}…\n`);
      }
      return lines.join('\n');
    }
  },

  ask: {
    async run(args, senderJid) {
      if (!args.length) return `❌ Usage: ${P}ask [your question]\nExample: ${P}ask What is the ruling on Witr prayer?`;
      const answer = await askIslamic(senderJid, args.join(' '));
      return `🤖 *NoorBot*\n\n${answer}`;
    }
  },

  clear: {
    async run(args, senderJid) {
      clearHistory(senderJid);
      return '✅ Conversation reset. Ask away, akhi!';
    }
  },

  names: {
    async run() {
      const list = [
        { ar: 'الرَّحْمَنُ', en: 'Ar-Rahman', m: 'The Most Gracious' },
        { ar: 'الرَّحِيمُ', en: 'Ar-Rahim', m: 'The Most Merciful' },
        { ar: 'الْمَلِكُ', en: 'Al-Malik', m: 'The Sovereign' },
        { ar: 'الْقُدُّوسُ', en: 'Al-Quddus', m: 'The Most Holy' },
        { ar: 'السَّلاَمُ', en: 'As-Salam', m: 'The Source of Peace' },
        { ar: 'الْخَالِقُ', en: 'Al-Khaliq', m: 'The Creator' },
        { ar: 'الرَّزَّاقُ', en: 'Ar-Razzaq', m: 'The Provider' },
        { ar: 'الْعَلِيمُ', en: 'Al-Alim', m: 'The All-Knowing' },
        { ar: 'الْحَكِيمُ', en: 'Al-Hakim', m: 'The Wise' },
        { ar: 'اللَّطِيفُ', en: 'Al-Latif', m: 'The Subtle, The Kind' },
        { ar: 'الْوَدُودُ', en: 'Al-Wadud', m: 'The Loving' },
        { ar: 'الْغَفَّارُ', en: 'Al-Ghaffar', m: 'The Oft-Forgiving' },
        { ar: 'التَّوَّابُ', en: 'At-Tawwab', m: 'The Acceptor of Repentance' },
        { ar: 'الصَّبُورُ', en: 'As-Sabur', m: 'The Patient One' },
        { ar: 'النُّورُ', en: 'An-Nur', m: 'The Light' },
        { ar: 'الْحَيُّ', en: 'Al-Hayy', m: 'The Ever-Living' },
        { ar: 'الْقَيُّومُ', en: 'Al-Qayyum', m: 'The Self-Subsisting' },
        { ar: 'الْعَفُوُّ', en: 'Al-Afuw', m: 'The Pardoner' },
        { ar: 'الشَّكُورُ', en: 'Ash-Shakur', m: 'The Appreciative' },
        { ar: 'الْكَرِيمُ', en: 'Al-Karim', m: 'The Most Generous' }
      ];
      const n = list[Math.floor(Math.random() * list.length)];
      return `✨ *Name of Allah*\n\n*${n.ar}*\n*${n.en}*\n_${n.m}_\n\nسُبْحَانَهُ وَتَعَالَى`;
    }
  },

  dua: {
    async run(args) {
      const occ = (args[0] ?? '').toLowerCase();
      const duas = {
        morning: {
          t: '🌅 Morning (Sabah)',
          ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
          tr: 'Asbahna wa asbahal mulku lillahi walhamdu lillah',
          en: 'We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is for Allah.',
          ref: 'Abu Dawud'
        },
        evening: {
          t: '🌙 Evening (Masa)',
          ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
          tr: 'Amsayna wa amsal mulku lillahi walhamdu lillah',
          en: 'We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is for Allah.',
          ref: 'Abu Dawud'
        },
        eating: {
          t: '🍽️ Before Eating',
          ar: 'بِسْمِ اللَّهِ',
          tr: 'Bismillah',
          en: 'In the name of Allah.',
          ref: 'Abu Dawud'
        },
        sleeping: {
          t: '😴 Before Sleeping',
          ar: 'اللَّهُمَّ بِاسْمِكَ أَمُوتُ وَأَحْيَا',
          tr: 'Allahumma bismika amutu wa ahya',
          en: 'O Allah, with Your name I die and I live.',
          ref: 'Bukhari'
        },
        travel: {
          t: '✈️ Dua for Travel',
          ar: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ',
          tr: 'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin',
          en: 'Glory be to Him Who has subjected this to us, and we could never have it by our own efforts.',
          ref: 'Muslim'
        },
        anxiety: {
          t: '💚 For Anxiety & Distress',
          ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ',
          tr: "Allahumma inni a'udhu bika minal-hammi wal-hazan",
          en: 'O Allah, I seek refuge in You from worry and grief.',
          ref: 'Bukhari'
        }
      };

      if (!occ || !duas[occ]) {
        return `❌ Usage: ${P}dua [occasion]\nAvailable: ${Object.keys(duas).join(', ')}`;
      }
      const d = duas[occ];
      return `${d.t}\n\n${d.ar}\n\n_${d.tr}_\n\n"${d.en}"\n\n📌 *Ref:* ${d.ref}`;
    }
  }
};

// ─── Router ───────────────────────────────────────────────────────────────────
export async function handleCommand(text, senderJid) {
  const P = process.env.BOT_PREFIX ?? '!';
  if (!text.trim().startsWith(P)) return null;

  const [rawCmd, ...args] = text.trim().slice(P.length).split(/\s+/);
  const cmd = rawCmd.toLowerCase();

  if (!COMMANDS[cmd]) {
    return `❓ Unknown command *${P}${cmd}*\nType ${P}help to see all commands.`;
  }

  try {
    return await COMMANDS[cmd].run(args, senderJid);
  } catch (err) {
    console.error(`[${cmd}] Error:`, err.message);
    // Give a helpful error for common failures
    if (err.message.includes('SUNNAH_API_KEY')) {
      return `⚠️ Sunnah.com API key not configured.\nAsk the admin to add SUNNAH_API_KEY to Replit Secrets.`;
    }
    return `⚠️ Error: ${err.message}`;
  }
}
