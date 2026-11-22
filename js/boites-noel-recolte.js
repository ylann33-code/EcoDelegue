import { connectFirebase, ref, get, onValue, push, runTransaction } from "./firebase.js";

const $ = id => document.getElementById(id);
const form = $("harvest-form");
const submit = $("harvest-submit");
let db = null;
let currentTotal = 0;
let historyEntries = [];

function frenchDate(timestamp) {
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Paris"
  }).format(new Date(timestamp));
}

function parisDateKey(timestamp) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date(timestamp));
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return values.year + "-" + values.month + "-" + values.day;
}

function renderHistory() {
  const container = $("harvest-history");
  const sorted = [...historyEntries].sort((a,b) => Number(b.updatedAt || 0) - Number(a.updatedAt || 0));
  if (!sorted.length) {
    container.innerHTML = '<p class="empty">Aucune mise à jour pour le moment.</p>';
  } else {
    const table = document.createElement("div");
    table.className = "harvest-history-list";
    sorted.slice(0, 100).forEach(entry => {
      const row = document.createElement("article");
      row.className = "harvest-history-row";
      const date = document.createElement("time");
      date.textContent = entry.updatedAt ? frenchDate(entry.updatedAt) : "Date inconnue";
      const details = document.createElement("div");
      const total = document.createElement("strong");
      total.textContent = Number(entry.total || 0).toLocaleString("fr-FR") + " boîtes au total";
      const change = document.createElement("small");
      change.textContent = "+" + Number(entry.added || 0).toLocaleString("fr-FR") + " boîte(s) ajoutée(s)";
      details.append(total, change);
      row.append(date, details);
      table.append(row);
    });
    container.replaceChildren(table);
  }

  const todayKey = parisDateKey(Date.now());
  const dailyTotals = {};
  historyEntries.forEach(entry => {
    if (!entry.updatedAt) return;
    const key = parisDateKey(Number(entry.updatedAt));
    dailyTotals[key] = (dailyTotals[key] || 0) + Number(entry.added || 0);
  });
  $("today-added").textContent = (dailyTotals[todayKey] || 0).toLocaleString("fr-FR");
  const best = Object.values(dailyTotals).reduce((max, value) => Math.max(max, value), 0);
  $("best-day").textContent = best.toLocaleString("fr-FR");
}

function renderTotal(data) {
  currentTotal = Number(data?.currentTotal || 0);
  $("harvest-total").textContent = currentTotal.toLocaleString("fr-FR");
  $("harvest-label").textContent = currentTotal > 1 ? "boîtes récoltées" : "boîte récoltée";
  $("harvest-updated").textContent = data?.lastUpdatedAt
    ? "Dernière mise à jour : " + frenchDate(Number(data.lastUpdatedAt))
    : "Aucune récolte enregistrée pour le moment.";
  $("new-total").value = String(currentTotal);
  historyEntries = Object.values(data?.history || {}).filter(item => item && typeof item === "object");
  renderHistory();
}

async function saveNewTotal(newTotal, code) {
  const passwordSnapshot = await get(ref(db, "motDePasse"));
  const savedPassword = passwordSnapshot.val();
  if (typeof savedPassword !== "string" || !/^\d{8}$/.test(savedPassword)) {
    throw new Error("Le code de publication à 8 chiffres n’est pas correctement configuré dans Firebase.");
  }
  if (code !== savedPassword.slice(0, 3)) {
    throw new Error("Le code de modification est incorrect.");
  }

  const historyKey = push(ref(db, "boitesNoelEtape2/history")).key;
  const timestamp = Date.now();
  const result = await runTransaction(ref(db, "boitesNoelEtape2"), data => {
    const current = data || {};
    const previousTotal = Number(current.currentTotal || 0);
    if (!Number.isSafeInteger(newTotal) || newTotal < previousTotal) return;
    const added = newTotal - previousTotal;
    if (!current.history || typeof current.history !== "object") current.history = {};
    current.currentTotal = newTotal;
    current.lastUpdatedAt = timestamp;
    current.history[historyKey] = {
      previousTotal,
      total: newTotal,
      added,
      updatedAt: timestamp
    };
    return current;
  });

  if (!result.committed) {
    throw new Error("Le total a changé entre-temps ou le nouveau total est inférieur au total actuel. Actualise la page et réessaie.");
  }
}

form.addEventListener("submit", async event => {
  event.preventDefault();
  const newTotal = Number($("new-total").value);
  const code = $("harvest-code").value.trim();
  if (!Number.isSafeInteger(newTotal) || newTotal < 0) {
    $("harvest-status").textContent = "Saisis un nombre entier positif ou nul.";
    return;
  }
  if (!/^\d{3}$/.test(code)) {
    $("harvest-status").textContent = "Le code doit contenir exactement 3 chiffres.";
    return;
  }
  if (newTotal < currentTotal) {
    $("harvest-status").textContent = "Le nouveau total ne peut pas être inférieur au total déjà enregistré.";
    return;
  }
  if (newTotal === currentTotal) {
    $("harvest-status").textContent = "Ce total est déjà enregistré : aucun changement à effectuer.";
    return;
  }

  submit.disabled = true;
  $("harvest-status").textContent = "Vérification du code et enregistrement…";
  try {
    await saveNewTotal(newTotal, code);
    form.reset();
    $("new-total").value = String(newTotal);
    $("harvest-status").textContent = "Compteur mis à jour ! L’historique a été enregistré.";
  } catch (error) {
    console.error("Mise à jour du compteur impossible :", error);
    $("harvest-status").textContent = error.message || "Enregistrement impossible. Vérifie ta connexion.";
  } finally {
    submit.disabled = false;
  }
});

async function start() {
  try {
    db = await connectFirebase();
    onValue(ref(db, "boitesNoelEtape2"), snapshot => {
      renderTotal(snapshot.val() || {});
    }, error => {
      console.error("Lecture du compteur impossible :", error);
      $("harvest-updated").textContent = "Impossible de lire le compteur. Vérifie les règles Firebase.";
      $("harvest-history").innerHTML = '<p class="empty">Historique indisponible.</p>';
    });
  } catch (error) {
    console.error("Connexion Firebase impossible :", error);
    $("harvest-updated").textContent = "Connexion à Firebase impossible.";
    $("harvest-history").innerHTML = '<p class="empty">Impossible de charger les données.</p>';
  }
}
start();
