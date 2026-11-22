import { connectFirebase, ref, onValue } from "./firebase.js";

const $ = id => document.getElementById(id);

async function loadUsefulLinks() {
  const container = $("useful-links-container");
  if (!container) return;
  try {
    const response = await fetch("data/useful-links.json");
    if (!response.ok) throw new Error("Configuration des liens indisponible");
    const config = await response.json();
    if (config.enabled !== true || !Array.isArray(config.links)) return;
    const validLinks = config.links.filter(link => typeof link.title === "string" && typeof link.url === "string" && /^https?:\/\//i.test(link.url));
    if (!validLinks.length) return;
    const heading = document.createElement("h3");
    heading.textContent = "Liens utiles";
    container.append(heading);
    const list = document.createElement("div");
    list.className = "links-list";
    validLinks.forEach(link => {
      const a = document.createElement("a");
      a.href = link.url; a.target = "_blank"; a.rel = "noopener noreferrer";
      a.append(document.createTextNode(link.title));
      const arrow = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      arrow.setAttribute("viewBox", "0 0 24 24"); arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML = '<path d="m9 18 6-6-6-6" fill="none" stroke="currentColor" stroke-width="2"/>';
      a.append(arrow); list.append(a);
    });
    container.append(list);
  } catch (error) { console.warn("Liens utiles non chargés :", error); }
}

async function loadLatestDocument() {
  const container = $("home-documents");
  if (!container) return;
  try {
    const response = await fetch("documents/documents.json");
    if (!response.ok) throw new Error("Catalogue de documents indisponible");
    const docs = await response.json();
    if (!Array.isArray(docs) || docs.length === 0) {
      container.innerHTML = '<p class="empty">Aucun document pour le moment.</p>';
      return;
    }
    const dateValue = value => {
      if (!value) return 0;
      const text = String(value).trim();
      const fr = text.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})$/);
      if (fr) return new Date(Number(fr[3]), Number(fr[2]) - 1, Number(fr[1])).getTime();
      return Date.parse(text) || 0;
    };
    const sorted = [...docs].filter(d => d && typeof d.file === "string" && d.file.trim() && !d.file.split("/").includes(".."))
      .sort((a, b) => dateValue(b.date) - dateValue(a.date));
    if (!sorted.length) {
      container.innerHTML = '<p class="empty">Aucun document pour le moment.</p>';
      return;
    }
    const rows = sorted.slice(0, 5).map(doc => {
      const path = "documents/" + doc.file.split("/").map(encodeURIComponent).join("/");
      const row = document.createElement("div");
      row.className = "doc-row home-latest-document";
      const icon = document.createElement("span"); icon.className = "doc-icon";
      icon.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2h8l4 4v16H6zM14 2v5h5M9 13h6M9 17h6"/></svg>';
      const details = document.createElement("div");
      const title = document.createElement("strong"); title.textContent = doc.title || doc.file;
      const meta = document.createElement("small"); meta.textContent = doc.date || "";
      details.append(title, meta);
      const link = document.createElement("a"); link.href = path; link.download = "";
      link.setAttribute("aria-label", "Télécharger " + (doc.title || doc.file));
      link.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12m-5-5 5 5 5-5M4 19h16"/></svg>';
      row.append(icon, details, link);
      return row;
    });
    container.replaceChildren(...rows);
  } catch (error) {
    console.error("Chargement des documents de l'accueil impossible :", error);
    container.innerHTML = '<p class="empty">Impossible de charger les documents.</p>';
  }
}

async function start() {
  await Promise.all([loadUsefulLinks(), loadLatestDocument()]);
  try {
    const classesResponse = await fetch("data/classes.json");
    if (!classesResponse.ok) throw new Error("Impossible de charger data/classes.json");
    const classes = await classesResponse.json();
    const total = Array.isArray(classes) ? classes.length : 0;
    const db = await connectFirebase();
    onValue(ref(db, "boitesNoel/status"), snapshot => {
      const statuses = snapshot.val() || {};
      const done = Array.isArray(classes) ? classes.filter(item => statuses[item.id]?.completed === true).length : 0;
      const pct = total ? Math.round(done / total * 100) : 0;
      if ($("progress-fill")) $("progress-fill").style.width = pct + "%";
      if ($("progress-percent")) $("progress-percent").textContent = pct + " %";
    }, error => console.error("Lecture progression Firebase :", error));
    onValue(ref(db, "dashboard/content"), snapshot => {
      const data = snapshot.val() || {};
      if (data.projectTitle && $("project-title")) $("project-title").textContent = data.projectTitle;
      if (data.projectDescription && $("project-description")) $("project-description").textContent = data.projectDescription;
      if (data.projectDates && $("project-dates")) $("project-dates").textContent = data.projectDates;
      if (data.welcomeTitle && $("welcome-title")) $("welcome-title").textContent = data.welcomeTitle;
      if (data.welcomeText && $("welcome-text")) $("welcome-text").textContent = data.welcomeText;
    }, error => console.error("Lecture tableau de bord Firebase :", error));
  } catch (error) { console.error("Initialisation de l'accueil impossible :", error); }
}

start();
