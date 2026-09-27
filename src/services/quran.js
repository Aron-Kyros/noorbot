// src/services/quran.js
import axios from 'axios';

// api.quran.com's public v4 verse/translation endpoints now sit behind a
// gated "Quran Foundation" platform requiring OAuth client credentials.
// islamic.app mirrors the same quran.com v4 resource shapes (verses,
// translations, tafsirs, word-by-word) behind a free, keyless API, so we
// use that as the host instead — no code-shape changes needed beyond the
// response envelope, which wraps everything in { code, status, data }.
const BASE = 'https://api.islamic.app/v1';

function buildTransliteration(words) {
  if (!Array.isArray(words)) return '';
  return words
    .map(w => w?.transliteration?.text)
    .filter(Boolean)
    .join(' ');
}

export async function getAyah(surah, ayah) {
  const key = `${surah}:${ayah}`;
  const { data } = await axios.get(`${BASE}/verses/by_key/${key}`, {
    params: {
      translations: 'en-sahih-international',
      words: true,
      fields: 'text_uthmani'
    }
  });
  const verse = data.data.verse;
  const arabic = verse.text_uthmani;
  const translation = verse.translations?.[0]?.text?.replace(/<[^>]+>/g, '') ?? '—';
  const transliteration = buildTransliteration(verse.words);
  return { surah, ayah, arabic, translation, transliteration, key };
}

export async function searchQuran(query) {
  const { data } = await axios.get(`${BASE}/search`, {
    params: { q: query, size: 5, language: 'en' }
  });
  return data.data?.search?.results ?? [];
}

export async function getTafsir(surah, ayah) {
  const key = `${surah}:${ayah}`;
  const { data } = await axios.get(`${BASE}/tafsirs/169/by_ayah/${key}`);
  const raw = data.data?.tafsir?.text ?? null;
  if (!raw) return null;
  const clean = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > 800 ? clean.slice(0, 800) + '…' : clean;
}

export async function randomVerse() {
  const randomSurah = Math.floor(Math.random() * 114) + 1;
  const { data } = await axios.get(`${BASE}/chapters/${randomSurah}`, { params: { language: 'en' } });
  const total = data.data.chapter.verses_count;
  const randomAyah = Math.floor(Math.random() * total) + 1;
  return getAyah(randomSurah, randomAyah);
}