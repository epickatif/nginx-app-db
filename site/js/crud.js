const API = "https://nginx-app-db-production-a8df.up.railway.app";

/* ------------- Rendering ------------- */
function renderNotes(data = []) {
  const ul = document.getElementById("records");
  ul.innerHTML = data.map(n => `
    <li class="note-card">
      <span class="note-title">${n.title}</span>
      <span class="note-body">${n.body}</span>
      <div class="note-actions">
        <button onclick="edit(${n.id})">✏️ Editar</button>
        <button onclick="del(${n.id})">🗑️ Borrar</button>
      </div>
    </li>
  `).join("");
}

/* ------------- CRUD ------------- */
async function fetchAll() {
  const res  = await fetch(API + "/records");
  const data = await res.json();
  renderNotes(data);
}

async function createNote(e) {
  e.preventDefault();
  const title = document.getElementById("titleInput").value.trim();
  const body  = document.getElementById("bodyInput").value.trim();
  if (!title || !body) return;

  await fetch(API + "/records", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body })
  });

  e.target.reset();
  fetchAll();
}

window.edit = async id => {
  const res  = await fetch(`${API}/records/${id}`);
  const note = await res.json();

  const title = prompt("Nuevo título", note.title);
  if (title === null) return;
  const body  = prompt("Nuevo contenido", note.body);
  if (body === null) return;

  await fetch(`${API}/records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body })
  });
  fetchAll();
};

window.del = async id => {
  if (!confirm("¿Eliminar nota?")) return;
  await fetch(`${API}/records/${id}`, { method: "DELETE" });
  fetchAll();
};

/* Init */
document.addEventListener("DOMContentLoaded", fetchAll);
