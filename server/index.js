import express from 'express'
import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = 3000

const db = new Database(join(__dirname, 'scores.db'))
db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

app.use(express.json())
app.use(express.static(join(__dirname, '..', 'client')))

app.post('/api/scores', (req, res) => {
  const { player_name, score } = req.body
  if (!player_name || score == null) {
    return res.status(400).json({ error: 'player_name and score are required' })
  }
  const stmt = db.prepare('INSERT INTO scores (player_name, score) VALUES (?, ?)')
  const result = stmt.run(player_name, score)
  res.status(201).json({ id: result.lastInsertRowid, player_name, score })
})

app.get('/api/scores/leaderboard', (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50)
  const rows = db.prepare('SELECT player_name, score, created_at FROM scores ORDER BY score DESC LIMIT ?').all(limit)
  res.json(rows)
})

app.get('/api/scores/:playerName', (req, res) => {
  const rows = db.prepare('SELECT score, created_at FROM scores WHERE player_name = ? ORDER BY created_at DESC').all(req.params.playerName)
  res.json(rows)
})

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
