// src/services/hadith.js
import axios from 'axios';

const SUNNAH_BASE = 'https://api.sunnah.com/v1';

export async function getHadith(collection, bookNum, hadithNum) {
  const key = process.env.SUNNAH_API_KEY;
  if (!key) throw new Error('SUNNAH_API_KEY not set in Replit Secrets');
  const { data } = await axios.get(
    `${SUNNAH_BASE}/collections/${collection}/books/${bookNum}/hadiths/${hadithNum}`,
    { headers: { 'X-API-Key': key } }
  );
  const h = data.data;
  return {
    arabic: h.hadith?.find(x => x.lang === 'ar')?.body ?? '',
    english: h.hadith?.find(x => x.lang === 'en')?.body ?? '',
    grade: h.grades?.[0]?.grade ?? ''
  };
}

export async function searchHadiths(query) {
  const key = process.env.SUNNAH_API_KEY;
  if (!key) throw new Error('SUNNAH_API_KEY not set in Replit Secrets');
  const { data } = await axios.get(`${SUNNAH_BASE}/hadiths/search`, {
    headers: { 'X-API-Key': key },
    params: { q: query, limit: 3 }
  });
  return data.data ?? [];
}

export const NAWAWI_40 = [
  { num: 1, text: "Actions are judged by intentions. Each person will be rewarded according to their intention. Whoever emigrates for the sake of Allah and His Messenger, their emigration is for Allah and His Messenger. And whoever emigrates to gain worldly benefit or to marry a woman, their emigration is for whatever they emigrated for.", ref: "Bukhari & Muslim" },
  { num: 2, text: "Islam is built on five: testifying that there is no god but Allah and that Muhammad is the Messenger of Allah, establishing the prayer, paying Zakah, fasting Ramadan, and performing Hajj if one is able.", ref: "Bukhari & Muslim" },
  { num: 3, text: "Islam was built on five pillars: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing prayer, paying Zakah, Hajj, and fasting Ramadan.", ref: "Bukhari & Muslim" },
  { num: 4, text: "The creation of each of you is brought together in your mother's womb for forty days in the form of a drop of fluid, then it is a clot for the same period, then a morsel for the same period, then an angel is sent who breathes the soul into it.", ref: "Bukhari & Muslim" },
  { num: 5, text: "Whoever introduces into this affair of ours something that does not belong to it, it is rejected.", ref: "Bukhari & Muslim" },
  { num: 6, text: "The halal is clear and the haram is clear, and between them are doubtful matters which many people do not know about. Whoever avoids doubtful matters has cleared himself with regard to his religion and his honor.", ref: "Bukhari & Muslim" },
  { num: 7, text: "Religion is sincerity. We asked: To whom? He said: To Allah, to His Book, to His Messenger, to the leaders of the Muslims and to their common people.", ref: "Muslim" },
  { num: 8, text: "I have been ordered to fight against people until they testify that there is no god but Allah and that Muhammad is the Messenger of Allah. If they do this then their blood and property are guaranteed protection on my part.", ref: "Bukhari & Muslim" },
  { num: 9, text: "What I have forbidden you to do, avoid. What I have ordered you to do, do as much of it as you can. It was only their excessive questioning and their disagreement with their Prophets that destroyed those who were before you.", ref: "Bukhari & Muslim" },
  { num: 10, text: "Allah is pure and good and He only accepts that which is pure and good. Allah commanded the believers with what He commanded the Messengers. He said: O Messengers, eat of the good things and do righteous deeds.", ref: "Muslim" },
  { num: 11, text: "Leave that which makes you doubt for that which does not make you doubt.", ref: "Tirmidhi & Nasa'i" },
  { num: 12, text: "Part of the perfection of a person's Islam is his leaving alone that which does not concern him.", ref: "Tirmidhi" },
  { num: 13, text: "None of you truly believes until he loves for his brother what he loves for himself.", ref: "Bukhari & Muslim" },
  { num: 14, text: "The blood of a Muslim may not be spilled except in three cases: in exchange for a life, the married person who commits adultery, and the one who turns away from his religion and abandons the community.", ref: "Bukhari & Muslim" },
  { num: 15, text: "Whoever believes in Allah and the Last Day, let him speak good or remain silent. Whoever believes in Allah and the Last Day, let him honor his neighbor. Whoever believes in Allah and the Last Day, let him honor his guest.", ref: "Bukhari & Muslim" },
  { num: 16, text: "Do not become angry.", ref: "Bukhari" },
  { num: 17, text: "Verily, Allah has prescribed excellence (ihsan) in all things. So if you kill, kill well; and if you slaughter, slaughter well. Let each of you sharpen his blade and spare suffering to the animal he slaughters.", ref: "Muslim" },
  { num: 18, text: "Fear Allah wherever you are. Follow up a bad deed with a good deed and it will wipe it out. And behave well toward people.", ref: "Tirmidhi" },
  { num: 19, text: "Guard Allah's commandments and Allah will protect you. Guard Allah's commandments and you will find Him in front of you. If you ask, ask Allah; if you seek help, seek help from Allah.", ref: "Tirmidhi" },
  { num: 20, text: "Be mindful of modesty. Everything has a characteristic, and the characteristic of this religion is hayaa (modesty/shyness).", ref: "Ibn Majah" },
  { num: 21, text: "Say: I believe in Allah, and then be steadfast.", ref: "Muslim" },
  { num: 22, text: "I would command you to do ten things... Do not get angry, do not be excessive, do not ask for things you do not need.", ref: "Ahmad" },
  { num: 23, text: "Purification is half of faith. Alhamdulillah fills the scales. SubhanAllah and Alhamdulillah fill what is between the heavens and the earth.", ref: "Muslim" },
  { num: 24, text: "O My servants, it is only your deeds that I account to you. He who finds good, let him praise Allah, and he who finds other than that, let him blame no one but himself.", ref: "Muslim" },
  { num: 25, text: "Charity is due upon every joint of a person on every day the sun rises. Doing justice between two people is charity. Helping a man with his mount is charity. A good word is charity. Every step taken toward the prayer is charity.", ref: "Bukhari & Muslim" },
  { num: 26, text: "Every act of goodness is charity.", ref: "Muslim" },
  { num: 27, text: "Righteousness is good character, and sin is that which wavers in your soul and which you dislike people finding out about.", ref: "Muslim" },
  { num: 28, text: "Be in this world as though you were a stranger or a wayfarer.", ref: "Bukhari" },
  { num: 29, text: "If the son of Adam had two valleys of wealth, he would seek a third. Nothing fills the belly of the son of Adam except dust (i.e., death). And Allah forgives those who repent.", ref: "Bukhari & Muslim" },
  { num: 30, text: "Verily, Allah has obligated certain limits, so do not transgress them. He has set boundaries, so do not violate them. He has forbidden things, so do not fall into them.", ref: "Bukhari & Nasa'i" },
  { num: 31, text: "Asceticism in this world does not mean making the halal forbidden, nor wasting wealth. Rather, asceticism is that you have more trust in what is in Allah's Hand than what is in your own hand.", ref: "Tirmidhi" },
  { num: 32, text: "There should be neither harming nor reciprocating harm.", ref: "Ibn Majah & Daraqutni" },
  { num: 33, text: "The one who falsely claims something that is not his is not from us, and let him take his seat in the Hellfire.", ref: "Muslim" },
  { num: 34, text: "Whoever sees something evil should change it with his hand; if he cannot, then with his tongue; if he cannot, then with his heart — and that is the weakest of faith.", ref: "Muslim" },
  { num: 35, text: "Do not envy each other, do not artificially inflate prices against each other, do not hate each other, do not turn away from each other. Be servants of Allah, brothers to one another.", ref: "Muslim" },
  { num: 36, text: "Whoever relieves a believer's distress of the distressful aspects of this world, Allah will rescue him from a difficulty of the difficulties of the Hereafter.", ref: "Muslim" },
  { num: 37, text: "Allah has pardoned my Ummah for honest mistakes, forgetfulness, and for what they were compelled to do.", ref: "Ibn Majah & Bayhaqi" },
  { num: 38, text: "Allah Almighty said: Whoever shows enmity to a friend (wali) of Mine, I shall be at war with him. My servant does not draw near to Me with anything more loved by Me than the religious duties I have obligated upon him.", ref: "Bukhari" },
  { num: 39, text: "Allah has forgiven my Ummah for mistakes, forgetfulness, and for what they were coerced into.", ref: "Ibn Majah" },
  { num: 40, text: "Be in this world a stranger or a passerby, and consider yourself among the inhabitants of the graves.", ref: "Bukhari" },
  { num: 41, text: "None of you should make a man rise from his seat and then sit in it. Rather, make room and spread out.", ref: "Bukhari & Muslim" },
  { num: 42, text: "Whoever believes in Allah and the Last Day should not harm his neighbor. Whoever believes in Allah and the Last Day should be generous to his guest. Whoever believes in Allah and the Last Day should speak good or remain silent.", ref: "Bukhari & Muslim" }
];

export function getNawawiHadith(num) {
  return NAWAWI_40.find(h => h.num === num) ?? null;
}
