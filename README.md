# 🌙 NoorBot — Islamic WhatsApp Bot

> *بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ*

Islamic WhatsApp bot — Quran lookup, Tafsir Ibn Kathir, 40 Hadith An-Nawawi, Sunnah.com search, and AI-powered Islamic Q&A.

**Stack:** Node.js · Baileys · Groq llama-3.3-70b · Quran.com API v4 · Sunnah.com API  
**Hosting:** Replit (always-on via UptimeRobot) · Session stored in Replit DB

---

## 🚀 Deploy on Replit

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "NoorBot initial"
git remote add origin https://github.com/YOUR_USERNAME/noorbot.git
git push -u origin main
```

### 2. Import to Replit
- Go to [replit.com](https://replit.com) → **Create Repl** → **Import from GitHub**
- Select your repo → Language: **Node.js**

### 3. Add Secrets (Replit Sidebar → Tools → Secrets)
| Key | Value |
|-----|-------|
| `GROQ_API_KEY` | Your Groq key |
| `SUNNAH_API_KEY` | Your Sunnah.com key (free at sunnah.com/developers) |
| `BOT_PREFIX` | `!` (or any prefix you want) |

### 4. Run
Click **Run**. Scan the QR code in the Replit console with WhatsApp → **Linked Devices → Link a Device**.

> Session is saved to Replit DB automatically — you won't need to re-scan unless you log out.

### 5. Set up UptimeRobot (free, keeps Replit alive)
1. Go to [uptimerobot.com](https://uptimerobot.com) → Add New Monitor
2. Type: **HTTP(s)**
3. URL: `https://YOUR-REPL-NAME.YOUR-USERNAME.repl.co/ping`
4. Interval: **5 minutes**

---

## 💬 Commands

### 📖 Quran
```
!quran 2:255        Ayatul Kursi
!quran 36:1         Surah Ya-Sin, verse 1
!tafsir 112:1       Tafsir Ibn Kathir — Al-Ikhlas
!search patience    Keyword search across Quran
!verse              Random verse of the day
```

### 📚 Hadith
```
!nawawi 13          "None of you truly believes..." + AI explanation
!nawawi 32          "No harm shall be inflicted or reciprocated"
!hadith bukhari 1 1
!hadith muslim 1 1
!hsearch kindness
```
Collections: `bukhari` `muslim` `abudawud` `tirmidhi` `nasai` `ibnmajah`

### 🤖 Islamic AI Q&A
```
!ask What is the ruling on Witr prayer in the Maliki madhab?
!ask Explain the concept of Tawakkul
!ask Who was Imam Malik and what is his methodology?
!ask What are the conditions for valid Tayammum?
!clear              Reset your conversation history
```
The AI keeps conversation context — follow-up questions work naturally.

### 📿 Daily
```
!names              Random Name of Allah with Arabic + meaning
!dua morning
!dua evening
!dua eating
!dua sleeping
!dua travel
!dua anxiety
!help               Full command list
```

---

## 🏗️ Project Structure

```
noorbot/
├── src/
│   ├── index.js              Main bot (Baileys + boot)
│   ├── session.js            Replit DB session persistence
│   ├── server.js             Express server for UptimeRobot
│   ├── handlers/
│   │   └── commands.js       All 11 commands
│   └── services/
│       ├── quran.js          Quran.com API v4
│       ├── hadith.js         Sunnah.com API + 40 Nawawi built-in
│       └── ai.js             Groq llama-3.3-70b Islamic Q&A
├── .replit
├── .gitignore
└── package.json
```

---

## 🔒 Security Notes
- **Never commit API keys** — use Replit Secrets only
- `auth_info/` is in `.gitignore` — WhatsApp session never touches GitHub
- Replit DB stores session data encrypted at rest

---

*May Allah put barakah in this work. آمين*
