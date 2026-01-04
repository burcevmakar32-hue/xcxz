require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Database } = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await open({ filename: './db.sqlite', driver: Database });
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      telegram_id TEXT UNIQUE,
      stars_balance INTEGER DEFAULT 1000,
      ton_balance REAL DEFAULT 0.0
    )
  `);
  console.log('✅ База данных готова');
})();

app.get('/api/user/:id', async (req, res) => {
  const { id } = req.params;
  const user = await db.get('SELECT * FROM users WHERE telegram_id = ?', id);
  if (!user) {
    await db.run('INSERT INTO users (telegram_id) VALUES (?)', id);
    return res.json({ telegram_id: id, stars_balance: 1000, ton_balance: 0 });
  }
  res.json(user);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🌐 Сервер запущен: http://localhost:${PORT}`);
});
