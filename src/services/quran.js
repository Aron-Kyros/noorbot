// src/services/quran.js
import axios from 'axios';

const BASE = 'https://api.quran.com/api/v4';

export async function getAyah(surah, ayah) {
  const key = `${surah}:${ayah}`;
  const { data } = await axios.get(`${BASE}/verses/by_key/${key}`, {
    params: {
      language: 'en',
      words: false,
      translations: 131, // Saheeh International
      fields: 'text_uthmani'
    }
  });
  const verse = data.verse;
  const arabic = verse.text_uthmani;
  const translation = verse.translations?.[0]?.text?.replace(/<[^>]+>/g, '') ?? '—';
  return { surah, ayah, arabic, translation, key };
}

export async function searchQuran(query) {
  const { data } = await axios.get(`${BASE}/search`, {
    params: { q: query, size: 5, language: 'en' }
  });
  return data.search?.results ?? [];
}

export async function getTafsir(surah, ayah) {
  const key = `${surah}:${ayah}`;
  const { data } = await axios.get(`${BASE}/tafsirs/169/by_ayah/${key}`);
  const raw = data.tafsir?.text ?? null;
  if (!raw) return null;
  const clean = raw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return clean.length > 800 ? clean.slice(0, 800) + '…' : clean;
}

export async function randomVerse() {
  const randomSurah = Math.floor(Math.random() * 114) + 1;
  const { data } = await axios.get(`${BASE}/chapters/${randomSurah}`, { params: { language: 'en' } });
  const total = data.chapter.verses_count;
  const randomAyah = Math.floor(Math.random() * total) + 1;
  return getAyah(randomSurah, randomAyah);
}
