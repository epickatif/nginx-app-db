import express from "express";
import pkg from "pg";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

await pool.query(`
  CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    body  TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/records", async (_, res) => {
  const { rows } = await pool.query("SELECT * FROM notes ORDER BY id");
  res.json(rows);
});

app.get("/records/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM notes WHERE id=$1", [req.params.id]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
});

app.post("/records", async (req, res) => {
  const { title, body } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO notes(title, body) VALUES($1,$2) RETURNING *", [title, body]
  );
  res.status(201).json(rows[0]);
});

app.put("/records/:id", async (req, res) => {
  const { title, body } = req.body;
  const { rows } = await pool.query(
    "UPDATE notes SET title=$1, body=$2 WHERE id=$3 RETURNING *",
    [title, body, req.params.id]
  );
  rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
});

app.delete("/records/:id", async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id=$1", [req.params.id]);
  res.sendStatus(204);
});

app.listen(process.env.PORT || 8080);
