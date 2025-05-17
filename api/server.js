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
    body TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );
`);

const app = express();
app.use(cors());
app.use(express.json());

app.get("/records", async (req, res) => {
  const { category } = req.query;
  let query = "SELECT * FROM notes";
  const params = [];

  if (category) {
    query += " WHERE category = $1";
    params.push(category);
  }

  query += " ORDER BY created_at DESC";

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

app.get("/records/:id", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM notes WHERE id=$1", [req.params.id]);
  rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
});

app.post("/records", async (req, res) => {
  const { title, body, category = 'general' } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO notes(title, body, category) VALUES($1,$2,$3) RETURNING *",
    [title, body, category]
  );
  res.status(201).json(rows[0]);
});

app.put("/records/:id", async (req, res) => {
  const { title, body, category } = req.body;
  const updateFields = [];
  const values = [];
  let paramIndex = 1;

  if (title !== undefined) {
    updateFields.push(`title=$${paramIndex}`);
    values.push(title);
    paramIndex++;
  }

  if (body !== undefined) {
    updateFields.push(`body=$${paramIndex}`);
    values.push(body);
    paramIndex++;
  }

  if (category !== undefined) {
    updateFields.push(`category=$${paramIndex}`);
    values.push(category);
    paramIndex++;
  }

  // Always update the updated_at timestamp
  updateFields.push(`updated_at=NOW()`);

  // Add the ID as the last parameter
  values.push(req.params.id);

  const { rows } = await pool.query(
    `UPDATE notes SET ${updateFields.join(', ')} WHERE id=$${paramIndex} RETURNING *`,
    values
  );

  rows.length ? res.json(rows[0]) : res.status(404).json({ error: "Not found" });
});

app.delete("/records/:id", async (req, res) => {
  await pool.query("DELETE FROM notes WHERE id=$1", [req.params.id]);
  res.sendStatus(204);
});

// Ruta para obtener todas las categorías disponibles
app.get("/categories", async (_, res) => {
  const { rows } = await pool.query("SELECT DISTINCT category FROM notes ORDER BY category");
  res.json(rows.map(row => row.category));
});

app.listen(process.env.PORT || 8080);
