const API = "https://nginx-app-db-production-a8df.up.railway.app";

// Estado global
let currentCategory = null;
let categories = ['general', 'trabajo', 'personal', 'ideas', 'recordatorios'];

/* ------------- Rendering ------------- */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function renderNotes(data = []) {
  const ul = document.getElementById("records");

  if (data.length === 0) {
    ul.innerHTML = `
      <li class="note-card" style="grid-column: 1 / -1; text-align: center;">
        <p>No hay notas disponibles${currentCategory ? ` en la categoría "${currentCategory}"` : ''}.</p>
      </li>
    `;
    return;
  }

  ul.innerHTML = data.map(n => `
    <li class="note-card">
      <span class="note-category">${n.category || 'general'}</span>
      <span class="note-title">${n.title}</span>
      <span class="note-body">${n.body}</span>
      <span class="note-date">
        ${n.updated_at && n.updated_at !== n.created_at
          ? `Actualizado: ${formatDate(n.updated_at)}`
          : `Creado: ${formatDate(n.created_at)}`}
      </span>
      <div class="note-actions">
        <button onclick="edit(${n.id})">✏️ Editar</button>
        <button onclick="del(${n.id})" class="delete">🗑️ Borrar</button>
      </div>
    </li>
  `).join("");
}

function renderCategoryFilters() {
  const container = document.getElementById("categoryFilters");

  // Añadir filtro para "Todas"
  let html = `<button class="category-filter ${!currentCategory ? 'active' : ''}"
                     onclick="filterByCategory(null)">Todas</button>`;

  // Añadir filtros para cada categoría
  categories.forEach(cat => {
    html += `<button class="category-filter ${currentCategory === cat ? 'active' : ''}"
                    onclick="filterByCategory('${cat}')">${cat}</button>`;
  });

  container.innerHTML = html;
}

/* ------------- CRUD ------------- */
async function fetchCategories() {
  try {
    const res = await fetch(API + "/categories");
    const data = await res.json();

    // Combinar categorías predefinidas con las de la base de datos
    const predefinedCategories = ['general', 'trabajo', 'personal', 'ideas', 'recordatorios'];
    categories = [...new Set([...predefinedCategories, ...data])];

    renderCategoryFilters();
  } catch (error) {
    console.error("Error al cargar categorías:", error);
  }
}

async function fetchAll() {
  try {
    let url = API + "/records";
    if (currentCategory) {
      url += `?category=${currentCategory}`;
    }

    const res = await fetch(url);
    const data = await res.json();
    renderNotes(data);
  } catch (error) {
    console.error("Error al cargar notas:", error);
    document.getElementById("records").innerHTML = `
      <li class="note-card" style="grid-column: 1 / -1; text-align: center;">
        <p>Error al cargar las notas. Por favor, intenta de nuevo más tarde.</p>
      </li>
    `;
  }
}

window.filterByCategory = (category) => {
  currentCategory = category;
  renderCategoryFilters();
  fetchAll();
};

async function createNote(e) {
  e.preventDefault();
  const title = document.getElementById("titleInput").value.trim();
  const body = document.getElementById("bodyInput").value.trim();
  const category = document.getElementById("categoryInput").value;

  if (!title || !body) return;

  try {
    await fetch(API + "/records", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, category })
    });

    e.target.reset();
    // Seleccionar la categoría por defecto después de crear
    document.getElementById("categoryInput").value = "general";

    // Actualizar la lista de categorías y notas
    await fetchCategories();
    await fetchAll();
  } catch (error) {
    console.error("Error al crear nota:", error);
    alert("No se pudo crear la nota. Por favor, intenta de nuevo.");
  }
}

window.edit = async id => {
  try {
    const res = await fetch(`${API}/records/${id}`);
    const note = await res.json();

    // Crear un modal para editar la nota
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.innerHTML = `
      <div class="edit-modal-content">
        <h3>Editar nota</h3>
        <form id="editForm">
          <input type="text" id="editTitle" value="${note.title}" required />
          <select id="editCategory">
            ${categories.map(cat => `
              <option value="${cat}" ${note.category === cat ? 'selected' : ''}>${cat}</option>
            `).join('')}
          </select>
          <textarea id="editBody" rows="4" required>${note.body}</textarea>
          <div class="modal-actions">
            <button type="button" id="cancelEdit" class="btn secondary">Cancelar</button>
            <button type="submit" class="btn primary">Guardar cambios</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Estilos para el modal
    const style = document.createElement('style');
    style.textContent = `
      .edit-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .edit-modal-content {
        background: var(--bg-color);
        border-radius: 8px;
        padding: 20px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      }
      .edit-modal h3 {
        margin-bottom: 15px;
        color: var(--primary);
      }
      .edit-modal input,
      .edit-modal textarea,
      .edit-modal select {
        width: 100%;
        padding: 10px;
        margin-bottom: 15px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--bg-color);
        color: var(--text);
      }
      .modal-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }
    `;
    document.head.appendChild(style);

    // Manejar el envío del formulario
    document.getElementById('editForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('editTitle').value.trim();
      const body = document.getElementById('editBody').value.trim();
      const category = document.getElementById('editCategory').value;

      if (!title || !body) return;

      await fetch(`${API}/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, category })
      });

      // Eliminar el modal
      document.body.removeChild(modal);
      document.head.removeChild(style);

      // Actualizar la lista de categorías y notas
      await fetchCategories();
      await fetchAll();
    });

    // Manejar el botón de cancelar
    document.getElementById('cancelEdit').addEventListener('click', () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    });
  } catch (error) {
    console.error("Error al editar nota:", error);
    alert("No se pudo editar la nota. Por favor, intenta de nuevo.");
  }
};

window.del = async id => {
  if (!confirm("¿Estás seguro de que deseas eliminar esta nota?")) return;

  try {
    await fetch(`${API}/records/${id}`, { method: "DELETE" });

    // Actualizar la lista de categorías y notas
    await fetchCategories();
    await fetchAll();
  } catch (error) {
    console.error("Error al eliminar nota:", error);
    alert("No se pudo eliminar la nota. Por favor, intenta de nuevo.");
  }
};

/* Tema oscuro */
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const htmlElement = document.documentElement;

  // Verificar si hay un tema guardado en localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    htmlElement.setAttribute('data-theme', savedTheme);
  }

  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  });
}

/* Navegación */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Función para actualizar la navegación activa
  function updateActiveNav() {
    let currentSection = '';

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;

      if (window.scrollY >= sectionTop - 100 && window.scrollY < sectionTop + sectionHeight - 100) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  }

  // Actualizar navegación al hacer scroll
  window.addEventListener('scroll', updateActiveNav);

  // Navegación suave al hacer clic en los enlaces
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      window.scrollTo({
        top: targetSection.offsetTop - 50,
        behavior: 'smooth'
      });

      // Actualizar URL sin recargar la página
      history.pushState(null, null, targetId);

      // Actualizar navegación activa
      navLinks.forEach(link => link.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // Inicializar navegación activa
  updateActiveNav();
}

/* Init */
document.addEventListener("DOMContentLoaded", async () => {
  initThemeToggle();
  initNavigation();
  await fetchCategories();
  await fetchAll();
});
