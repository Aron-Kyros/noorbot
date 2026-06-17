// src/server.js
// Lightweight Express server for UptimeRobot keep-alive ping

import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>NoorBot</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:40px;background:#0d1117;color:#e6edf3">
        <h1>🌙 NoorBot</h1>
        <p>Islamic WhatsApp Bot is running.</p>
        <p style="color:#3fb950">Status: Online ✓</p>
        <p style="font-size:12px;color:#8b949e">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
      </body>
    </html>
  `);
});

app.get('/ping', (req, res) => {
  res.json({ status: 'alive', bot: 'NoorBot', time: new Date().toISOString() });
});

export function startServer() {
  app.listen(PORT, () => {
    console.log(`🌐 Keep-alive server running on port ${PORT}`);
    console.log(`📌 Add this URL to UptimeRobot: https://YOUR-REPL-NAME.YOUR-USERNAME.repl.co/ping`);
  });
}
