import express from 'express';
import cors from 'cors';
import pool from './db.js';
const app = express();
const PORT = process.env.PORT || 8080;
app.use(cors());
app.use(express.json());
app.get('/items', async (_, res) => {
  const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
  res.json(rows);
});
app.get('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT * FROM items WHERE id=$1', [id]);
  rows.length ? res.json(rows[0]) : res.sendStatus(404);
});
app.post('/items', async (req, res) => {
  const { title, description } = req.body;
  const { rows } = await pool.query(
    'INSERT INTO items(title,description) VALUES($1,$2) RETURNING *',
    [title, description]
  );
  res.status(201).json(rows[0]);
});
app.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const { rowCount } = await pool.query(
    'UPDATE items SET title=$1, description=$2 WHERE id=$3',
    [title, description, id]
  );
  rowCount ? res.sendStatus(204) : res.sendStatus(404);
});
app.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM items WHERE id=$1', [id]);
  rowCount ? res.sendStatus(204) : res.sendStatus(404);
});
app.listen(PORT, () => console.log(`API listening on ${PORT}`));
