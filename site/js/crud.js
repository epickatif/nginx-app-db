// Reemplaza esta URL con la de tu servicio API en Railway
const API = "https://nginx-app-db-production-a8df.up.railway.app";

async function fetchAll() {
  const r = await fetch(`${API}/records`);
  const data = await r.json();
  const list = document.getElementById("records");
  list.innerHTML = data.map(n => `
    <li>
      <span><strong>${n.title}</strong></span>
      <span>
        <button onclick="edit(${n.id})">✏️</button>
        <button onclick="del(${n.id})">🗑️</button>
      </span>
    </li>`).join("");
}

async function add() {
  const title = prompt("Título");
  if (!title) return;
  const body = prompt("Contenido");
  await fetch(`${API}/records`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body })
  });
  fetchAll();
}

window.edit = async id => {
  const r = await fetch(`${API}/records/${id}`);
  const val = await r.json();
  const title = prompt("Título:", val.title);
  const body = prompt("Contenido:", val.body);
  await fetch(`${API}/records/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body })
  });
  fetchAll();
};

window.del = async id => {
  if (!confirm("¿Seguro de borrar?")) return;
  await fetch(`${API}/records/${id}`, { method: "DELETE" });
  fetchAll();
};

document.addEventListener("DOMContentLoaded", fetchAll);
