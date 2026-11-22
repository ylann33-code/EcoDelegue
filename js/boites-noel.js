import { connectFirebase, ref, onValue, set } from "./firebase.js";

const list = document.getElementById("class-list");
const sync = document.getElementById("sync-status");
const search = document.getElementById("class-search");
const filters = [...document.querySelectorAll(".filter-button")];
let classes = [];
let statuses = {};
let currentFilter = "all";
let db = null;
let step1Locked = false;
let busy = new Set();
const pendingStates = new Map();

const dateFormatter = new Intl.DateTimeFormat("fr-FR", { day:"numeric", month:"long", year:"numeric" });

function formatSchedule(item) {
  const parts = [];
  if (item.date) {
    const d = new Date(item.date + "T12:00:00");
    parts.push(dateFormatter.format(d));
  } else {
    parts.push("Date à compléter");
  }
  if (item.time) parts.push(escapeHtml(item.time.replace(":", "h")));
  if (item.room) parts.push(`salle ${escapeHtml(item.room)}`);
  return `<b>${parts.join(" · ")}</b>`;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function isDone(id) { return statuses[id]?.completed === true; }
function localDateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}

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
        <label class="class-check"><input type="checkbox" data-check="${escapeHtml(item.id)}" ${done ? "checked" : ""} ${busy.has(item.id) || step1Locked ? "disabled" : ""}><span>${done ? "Terminée" : "Valider"}</span></label>
      </article>`;
    }).join("");
  }
  const doneCount = classes.filter(item => isDone(item.id)).length;
  const ratio = classes.length ? Math.round(doneCount / classes.length * 100) : 0;
  document.getElementById("summary-count").textContent = `${doneCount} / ${classes.length}`;
  document.getElementById("summary-fill").style.width = ratio + "%";
  document.getElementById("summary-percent").textContent = ratio + " %";
  list.querySelectorAll("[data-check]").forEach(input => {
    input.addEventListener("change", () => updateStatus(input.dataset.check, input.checked));
  });
}
async function updateStatus(id, completed) {
  if (!db || busy.has(id) || step1Locked) return;
  const previous = statuses[id] ? { ...statuses[id] } : {};
  const next = { completed, updatedAt: Date.now() };
  busy.add(id);
  pendingStates.set(id, next);
  statuses[id] = next;
  render();
  try {
    await set(ref(db, `boitesNoel/status/${id}`), next);
    sync.textContent = "Progression synchronisée.";
  } catch (error) {
    statuses[id] = previous;
    sync.textContent = "Enregistrement impossible. Vérifiez les règles Firebase et votre connexion.";
    console.error(error);
  } finally {
    pendingStates.delete(id);
    busy.delete(id);
    render();
  }
}
async function start() {
  try {
    const [classesResponse, projectsResponse] = await Promise.all([
      fetch("data/classes.json"),
      fetch("data/projects.json")
    ]);
    if (!classesResponse.ok) throw new Error("Impossible de charger data/classes.json.");
    if (!projectsResponse.ok) throw new Error("Impossible de charger data/projects.json.");
    classes = await classesResponse.json();
    const projectConfig = await projectsResponse.json();
    const step1 = Array.isArray(projectConfig.projects)
      ? projectConfig.projects.find(project => project.id === "boites-noel-etape-1")
      : null;
    step1Locked = Boolean(step1?.editableUntil && localDateKey() > step1.editableUntil);
    if (step1Locked) {
      sync.textContent = "La date limite de l’étape 1 est dépassée : les validations sont clôturées. La progression reste consultable.";
    }
    db = await connectFirebase();
    onValue(ref(db, "boitesNoel/status"), snapshot => {
      statuses = snapshot.val() || {};
      for (const [id, pending] of pendingStates) statuses[id] = pending;
      render();
      sync.textContent = step1Locked
        ? "Date limite dépassée : consultation uniquement. Les changements des autres utilisateurs restent visibles."
        : "Connecté : les changements des autres utilisateurs apparaissent automatiquement.";
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
