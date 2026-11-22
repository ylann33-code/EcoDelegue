import { connectFirebase, ref, onValue, get, set, push } from "./firebase.js";

const $ = id => document.getElementById(id);
const dialog = $("message-dialog");
const form = $("message-form");
const list = $("announcement-list");
const status = $("message-status");

function showStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#a32626" : "#386b45";
}

function renderAnnouncements(data) {
  const entries = Object.entries(data || {})
    .map(([id, value]) => ({ id, ...value }))
    .filter(item => item.title && item.text)
    .sort((a, b) => Number(b.createdAt || 0) - Number(a.createdAt || 0));
  if (!entries.length) {
    list.innerHTML = '<p class="empty">Aucune annonce pour le moment.</p>';
    return;
  }
  list.replaceChildren(...entries.map(item => {
    const article = document.createElement("article");
    article.className = "document-card announcement-card";
    article.style.display = "block";
    const heading = document.createElement("strong"); heading.textContent = item.title;
    const meta = document.createElement("small");
    meta.textContent = `${item.author || "Auteur inconnu"} · ${item.createdAt ? new Date(item.createdAt).toLocaleString("fr-FR") : "Date inconnue"}`;
    const body = document.createElement("p"); body.textContent = item.text; body.style.whiteSpace = "pre-wrap";
    article.append(heading, meta, body);
    return article;
  }));
}

$("open-message-form").addEventListener("click", () => { form.reset(); showStatus(""); dialog.showModal(); });
$("close-message-form").addEventListener("click", () => dialog.close());
dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });

form.addEventListener("submit", async event => {
  event.preventDefault();
  const title = $("message-title").value.trim();
  const author = $("message-author").value.trim();
  const text = $("message-text").value.trim();
  const password = $("message-password").value;
  if (!title || !author || !text) return showStatus("Merci de remplir tous les champs.", true);
  if (!/^\d{8}$/.test(password)) return showStatus("Le code doit contenir exactement 8 chiffres.", true);

  const submit = form.querySelector('[type="submit"]');
  submit.disabled = true;
  showStatus("Vérification et publication en cours…");
  try {
    const db = await connectFirebase();
    const passwordSnapshot = await get(ref(db, "motDePasse"));
    const savedPassword = passwordSnapshot.val();
    if (typeof savedPassword !== "string" || !savedPassword) {
      throw new Error("PASSWORD_NOT_CONFIGURED");
    }
    if (password !== savedPassword) {
      throw new Error("WRONG_PASSWORD");
    }
    await push(ref(db, "announcements"), {
      title,
      author,
      text,
      createdAt: Date.now()
    });
    form.reset();
    dialog.close();
  } catch (error) {
    console.error("Publication de l'annonce impossible :", error);
    const message = error.message === "WRONG_PASSWORD"
      ? "Le code de publication est incorrect."
      : error.message === "PASSWORD_NOT_CONFIGURED"
        ? "Le code de publication n'a pas encore été configuré dans Firebase."
        : "Publication impossible. Vérifie les règles Firebase et ta connexion.";
    showStatus(message, true);
  } finally {
    submit.disabled = false;
  }
});

async function start() {
  try {
    const db = await connectFirebase();
    onValue(ref(db, "announcements"), snapshot => renderAnnouncements(snapshot.val()), error => {
      console.error("Lecture des annonces Firebase impossible :", error);
      list.innerHTML = '<p class="empty">Impossible de charger les annonces. Vérifie les règles Firebase.</p>';
    });
  } catch (error) {
    console.error("Initialisation de la messagerie impossible :", error);
    list.innerHTML = '<p class="empty">Connexion à Firebase impossible.</p>';
  }
}
start();
