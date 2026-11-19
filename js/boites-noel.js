import { connectFirebase, ref, onValue, set } from "./firebase.js";

const list = document.getElementById("class-list");
const sync = document.getElementById("sync-status");
const search = document.getElementById("class-search");
const filters = [...document.querySelectorAll(".filter-button")];
let classes = [];
let statuses = {};
let currentFilter = "all";
let db = null;
let busy = new Set();

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day:"numeric", month:"long", year:"numeric" });

function formatSchedule(item) {
  if (!item.date) return '<span class="muted">Date à compléter</span>';
  const d = new Date(item.date + "T12:00:00");
  const date = dateFormatter.format(d);
  const time = item.time ? ` à ${escapeHtml(item.time.replace(":", "h"))}` : "";
  const room = item.room ? ` · salle ${escapeHtml(item.room)}` : "";
  return `<b>${escapeHtml(date)}${time}</b>${room}`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function isDone(id) { return statuses[id]?.completed === true; }

function render() {
  const query = search.value.trim().toLocaleLowerCase("fr");
  const visible = classes.filter(item => {
    const done = isDone(item.id);
    const matchesFilter = currentFilter === "all" || (currentFilter === "done" ? done : !done);
    const matchesSearch = `${item.name} ${item.people.join(" ")}`.toLocaleLowerCase("fr").includes(query);
    return matchesFilter && matchesSearch;
  });
  if (!visible.length) {
    list.innerHTML = '<div class="empty-card">Aucune classe ne correspond à votre recherche.</div>';
  } else {
    list.innerHTML = visible.map((item, index) => {
      const done = isDone(item.id);
      const people = item.people.length ? item.people.map(escapeHtml).join(" et ") : "À compléter";
      return `<article class="class-row ${done ? "done" : ""}" data-id="${escapeHtml(item.id)}">
        <span class="class-index">${String(classes.indexOf(item)+1).padStart(2,"0")}</span>
        <strong class="class-name">${escapeHtml(item.name)}</strong>
        <div class="class-meta">${formatSchedule(item)}</div>
        <div class="class-people"><strong>ÉCO-DÉLÉGUÉS</strong>${people}</div>
        <label class="class-check"><input type="checkbox" data-check="${escapeHtml(item.id)}" ${done ? "checked" : ""} ${busy.has(item.id) ? "disabled" : ""}><span>${done ? "Terminée" : "Valider"}</span></label>
      </article>`;
    }).join("");
  }
  const doneCount = classes.filter(item => isDone(item.id)).length;
  const ratio = Math.round(doneCount / classes.length * 100);
  document.getElementById("summary-count").textContent = `${doneCount} / ${classes.length}`;
  document.getElementById("summary-fill").style.width = ratio + "%";
  document.getElementById("summary-percent").textContent = ratio + " %";
  list.querySelectorAll("[data-check]").forEach(input => {
    input.addEventListener("change", () => updateStatus(input.dataset.check, input.checked));
  });
}
async function updateStatus(id, completed) {
  if (!db || busy.has(id)) return;
  busy.add(id); render();
  try {
    await set(ref(db, `boitesNoel/status/${id}`), {
      completed,
      updatedAt: Date.now()
    });
    sync.textContent = "Progression synchronisée.";
  } catch (error) {
    sync.textContent = "Enregistrement impossible. Vérifiez les règles Firebase et votre connexion.";
    console.error(error);
  } finally {
    busy.delete(id);
  }
}
async function start() {
  try {
    const response = await fetch("data/classes.json");
    if (!response.ok) throw new Error("Impossible de charger data/classes.json.");
    classes = await response.json();
    db = await connectFirebase();
    onValue(ref(db, "boitesNoel/status"), snapshot => {
      statuses = snapshot.val() || {};
      render();
      sync.textContent = "Connecté : les changements des autres utilisateurs apparaissent automatiquement.";
    }, error => {
      sync.textContent = "Erreur de lecture Firebase : vérifiez les règles de la base de données.";
      console.error(error);
    });
  } catch (error) {
    list.innerHTML = `<div class="empty-card">${escapeHtml(error.message)}</div>`;
    sync.textContent = "Connexion non établie.";
    console.error(error);
  }
}
filters.forEach(button => button.addEventListener("click", () => {
  filters.forEach(item => item.classList.toggle("selected", item === button));
  currentFilter = button.dataset.filter;
  render();
}));
search.addEventListener("input", render);
start();
