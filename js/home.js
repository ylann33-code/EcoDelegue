import { connectFirebase, ref, onValue } from "./firebase.js";

const $ = id => document.getElementById(id);

const projectIcons = {
  gift: '<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M2 9h20v4H2zM12 9v12M12 9c-5 0-7-1-7-4 0-2 2-3 4-2 2 1 3 6 3 6Zm0 0c5 0 7-1 7-4 0-2-2-3-4-2-2 1-3 6-3 6Z"/>',
  leaf: '<path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-7 11-16Z"/><path d="M3 21c4-6 8-9 14-13"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  sprout: '<path d="M12 21v-9"/><path d="M12 13C5 13 3 9 4 4c5 0 9 2 8 9Z"/><path d="M12 16c0-5 3-8 8-8 1 5-2 8-8 8Z"/>',
  recycle: '<path d="m7 7 2-3h6l2 3"/><path d="m17 7 2 3-2 3"/><path d="M19 10h-5"/><path d="m17 17-2 3H9l-2-3"/><path d="m7 17-2-3 2-3"/><path d="M5 14h5"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  water: '<path d="M12 3C9 7 5 11 5 15a7 7 0 0 0 14 0c0-4-4-8-7-12Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>',
  wind: '<path d="M3 8h12a3 3 0 1 0-3-3"/><path d="M2 12h17a2 2 0 1 1-2 2"/><path d="M4 16h8a3 3 0 1 1-3 3"/>',
  tree: '<path d="M12 22v-7"/><path d="m12 3 5 6h-3l5 6H5l5-6H7l5-6Z"/>',
  flower: '<path d="M12 13v9"/><path d="M12 8c-4-6-8 0-2 3-7 1-4 8 2 4 1 7 8 4 4-2 6-3 1-9-4-5Z"/><circle cx="12" cy="12" r="1.5"/>',
  bike: '<circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="m6 17 4-7 4 7H6Zm4-7h4m-1-3h3m-5 3 3 7"/>',
  school: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M9 20v-6h6v6M7 11h.01M12 11h.01M17 11h.01"/>',
  heart: '<path d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8.8 2.8Z"/>',
  hands: '<path d="m3 12 4-4 5 2 5-2 4 4-7 8-4-3-3 1-4-6Z"/><path d="m7 8 2-3 4 2 3-2 3 3"/>',
  book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 0 4 22z"/><path d="M4 5.5v14A2.5 2.5 0 0 1 6.5 17H20M8 7h8"/>',
  bottle: '<path d="M9 3h6v3l2 2v12a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8l2-2z"/><path d="M9 6h6M7 13h10"/>',
  trash: '<path d="M4 7h16M10 3h4M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
  food: '<path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M16 3v18m0-18c3 3 4 7 0 10"/>',
  community: '<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20a6 6 0 0 1 12 0m0-2a5 5 0 0 1 7 2"/>',
  seed: '<path d="M12 21v-8"/><path d="M12 13C4 13 4 5 5 4c7 0 9 4 7 9Z"/><path d="M12 16c0-5 4-8 8-8 1 5-2 8-8 8Z"/>'
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
  validProjects.sort((a, b) => (b.visibleFrom || "").localeCompare(a.visibleFrom || ""));
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

function formatHarvestCount(value) {
  const count = Math.max(0, Math.round(Number(value) || 0));
  return count.toLocaleString("fr-FR") + (count > 1 ? " boîtes" : " boîte");
}

function animateHarvestCount(from, to, duration = 1400) {
  const output = $("progress-percent");
  if (!output) return Promise.resolve();
  const start = performance.now();
  const difference = to - from;
  return new Promise(resolve => {
    function frame(now) {
      const ratio = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - ratio, 3);
      output.textContent = formatHarvestCount(from + difference * eased);
      if (ratio < 1) requestAnimationFrame(frame);
      else {
        output.textContent = formatHarvestCount(to);
        resolve();
      }
    }
    requestAnimationFrame(frame);
  });
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
    let firstSnapshot = true;
    onValue(ref(db, "boitesNoelEtape2"), async snapshot => {
      const data = snapshot.val() || {};
      const total = Math.max(0, Number(data.currentTotal || 0));
      if (firstSnapshot) {
        firstSnapshot = false;
        const latest = Object.values(data.history || {})
          .filter(entry => entry && Number.isFinite(Number(entry.updatedAt)))
          .sort((a, b) => Number(b.updatedAt) - Number(a.updatedAt))[0];
        if (latest && Number(latest.total) === total && Number(latest.added) > 0) {
          const previous = Math.max(0, Number(latest.previousTotal ?? (total - Number(latest.added))));
          await animateHarvestCount(0, previous, Math.min(1500, 500 + previous * 12));
          const badge = document.createElement("span");
          badge.className = "harvest-added-badge";
          const addedLabel = localDateKey(new Date(Number(latest.updatedAt))) === localDateKey()
            ? " aujourd’hui"
            : " au dernier ajout";
          badge.textContent = "+" + Number(latest.added).toLocaleString("fr-FR") + addedLabel;
          if (progress && !progress.querySelector(".harvest-added-badge")) progress.append(badge);
          await new Promise(resolve => setTimeout(resolve, 850));
          await animateHarvestCount(previous, total, 1200);
          window.setTimeout(() => badge.remove(), 3500);
        } else {
          await animateHarvestCount(0, total, 1500);
        }
      } else if ($("progress-percent")) {
        $("progress-percent").textContent = formatHarvestCount(total);
      }
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
