import { connectFirebase, ref, onValue } from "./firebase.js";

const $ = id => document.getElementById(id);

const projectIcons = {
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M2 9h20v4H2zM12 9v12M12 9c-5 0-7-1-7-4 0-2 2-3 4-2 2 1 3 6 3 6Zm0 0c5 0 7-1 7-4 0-2-2-3-4-2-2 1-3 6-3 6Z"/>',
  leaf: '<path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-7 11-16Z"/><path d="M3 21c4-6 8-9 14-13"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>'
};

function localDateKey(date = new Date()) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2,"0"), String(date.getDate()).padStart(2,"0")].join("-");
}

function renderProjects(projects) {
  const container = $("project-list");
  if (!container) return;
  const today = localDateKey();
  const validProjects = projects.filter(project =>
    project && typeof project.title === "string" &&
    typeof project.page === "string" &&
    /^[a-zA-Z0-9_./-]+\.html$/.test(project.page) &&
    !project.page.startsWith("/") && !project.page.split("/").includes("..") &&
    (!project.visibleFrom || project.visibleFrom <= today)
  );
  if (!validProjects.length) {
    container.innerHTML = '<p class="empty">Aucun projet pour le moment.</p>';
    return;
  }
  container.replaceChildren(...validProjects.map(project => {
    const link = document.createElement("a");
    link.className = "project-item project-link";
    link.href = project.page;
    link.setAttribute("aria-label", "Ouvrir le projet " + project.title);
    const thumb = document.createElement("span");
    thumb.className = "project-thumb";
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("fill", "none");
    icon.setAttribute("stroke", "currentColor");
    icon.setAttribute("stroke-width", "1.8");
    icon.setAttribute("stroke-linecap", "round");
    icon.setAttribute("stroke-linejoin", "round");
    icon.innerHTML = projectIcons[project.icon] || projectIcons.leaf;
    thumb.append(icon);
    const details = document.createElement("span");
    const title = document.createElement("strong");
    title.textContent = project.title;
    const description = document.createElement("span");
    description.className = "project-description-short";
    description.textContent = project.shortDescription || project.description || "";
    details.append(title, description);
    link.append(thumb, details);
    return link;
  }));
}

async function loadProjects() {
  const container = $("project-list");
  try {
    const response = await fetch("data/projects.json");
    if (!response.ok) throw new Error("Catalogue des projets indisponible");
    const config = await response.json();
    if (!config || !Array.isArray(config.projects)) throw new Error("Format du catalogue invalide");
    const today = localDateKey();
    const visibleProjects = config.projects.filter(project => !project.visibleFrom || project.visibleFrom <= today);
    renderProjects(config.projects);
    const featured = [...visibleProjects].sort((a,b) => (b.visibleFrom || "").localeCompare(a.visibleFrom || ""))[0]
      || config.projects.find(project => project.id === config.featuredProjectId);
    if (featured) {
      if ($("project-title")) $("project-title").textContent = featured.title;
      if ($("project-description")) $("project-description").textContent = featured.description || "";
      if ($("project-dates")) $("project-dates").textContent = featured.dates || "";
      const badge = document.querySelector(".hero .pill");
      if (badge) badge.textContent = featured.status || "PROJET À LA UNE";
      if (featured.progressSource === "boitesNoel") loadChristmasProgress();
      else if (featured.progressSource === "boitesNoelEtape2") loadChristmasHarvestTotal();
      else {
        const progress = document.querySelector(".hero-progress");
        if (progress) progress.hidden = true;
      }
    } else {
      if (container) container.innerHTML = '<p class="empty">Aucun projet à afficher.</p>';
    }
  } catch (error) {
    console.error("Chargement des projets impossible :", error);
    if (container) container.innerHTML = '<p class="empty">Impossible de charger les projets.</p>';
  }
}

async function loadChristmasHarvestTotal() {
  try {
    const db = await connectFirebase();
    const progress = document.querySelector(".hero-progress");
    const track = document.querySelector(".hero-progress .progress-track");
    if (track) track.hidden = true;
    const hero = document.querySelector(".hero");
    if (hero && !hero.querySelector(".gift-rain")) {
      const rain = document.createElement("div");
      rain.className = "gift-rain";
      rain.setAttribute("aria-hidden", "true");
      rain.innerHTML = '<span>🎁</span><span>🎄</span><span>🎁</span><span>✨</span><span>🎁</span><span>⭐</span><span>🎁</span>';
      hero.append(rain);
    }
    onValue(ref(db, "boitesNoelEtape2/currentTotal"), snapshot => {
      const total = Number(snapshot.val() || 0);
      if ($("progress-percent")) $("progress-percent").textContent = total.toLocaleString("fr-FR") + (total > 1 ? " boîtes" : " boîte");
      if (progress) progress.setAttribute("aria-label", "Nombre de boîtes récoltées");
    }, error => console.error("Lecture du compteur de boîtes :", error));
  } catch (error) {
    console.error("Initialisation du compteur de boîtes impossible :", error);
    if ($("progress-percent")) $("progress-percent").textContent = "— boîte";
  }
}

async function loadChristmasProgress() {
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
  } catch (error) {
    console.error("Initialisation de la progression impossible :", error);
    if ($("progress-percent")) $("progress-percent").textContent = "— %";
  }
}

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
      const fr = text.match(/^(\d{1,2})[\\/.\\-](\d{1,2})[\\/.\\-](\d{4})$/);
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

async function loadWelcomeContent() {
  try {
    const db = await connectFirebase();
    onValue(ref(db, "dashboard/content"), snapshot => {
      const data = snapshot.val() || {};
      if (data.welcomeTitle && $("welcome-title")) $("welcome-title").textContent = data.welcomeTitle;
      if (data.welcomeText && $("welcome-text")) $("welcome-text").textContent = data.welcomeText;
    }, error => console.error("Lecture du contenu d'accueil Firebase :", error));
  } catch (error) {
    console.error("Initialisation du contenu d'accueil impossible :", error);
  }
}

async function start() {
  await Promise.all([loadProjects(), loadUsefulLinks(), loadLatestDocument(), loadWelcomeContent()]);
}

start();
