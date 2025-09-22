// Minimal Express server to serve role stats from users.db (SQLite)
// Run: npm i express sqlite3 cors && node server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.static('.'));// serve static files (site)

// Open or create SQLite database file 'users.db' in project root
const db = new sqlite3.Database('users.db');

// Expected schema: table `users` with column `role` (TEXT)
// Example roles (case-insensitive): PRODUCERS, SMM, MOTION-DESIGN, DESIGN, DISTRIBUTORS, EDITOR

function normalizeRole(role){
  if (!role) return 'OTHER';
  const r = String(role).trim().toUpperCase();
  if (r.startsWith('PRODUCER')) return 'PRODUCERS';
  if (r === 'SMM' || r.includes('SMM')) return 'SMM';
  if (r.startsWith('MOTION')) return 'MOTION-DESIGN';
  if (r.includes('DESIGN') && !r.startsWith('MOTION')) return 'DESIGN';
  if (r.startsWith('DISTR') || r.includes('DIST')) return 'DISTRIBUTORS';
  if (r.startsWith('EDIT')) return 'EDITOR';
  return r;
}

app.get('/api/roles', (req, res) => {
  const sql = 'SELECT role FROM users';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const counts = {};
    rows.forEach(row => {
      const key = normalizeRole(row.role);
      counts[key] = (counts[key] || 0) + 1;
    });
    const total = Object.values(counts).reduce((a,b)=>a+b, 0) || 1;
    const wanted = ['PRODUCERS','SMM','MOTION-DESIGN','DESIGN','DISTRIBUTORS','EDITOR'];
    const data = wanted.map(label => ({
      label,
      count: counts[label] || 0,
      percent: Math.round(((counts[label] || 0) / total) * 100)
    }));
    res.json({ total, roles: data });
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));

