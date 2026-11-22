import { connectFirebase, ref, onValue } from "./firebase.js";

const fill = document.getElementById("progress-fill");
const count = document.getElementById("progress-count");
const percent = document.getElementById("progress-percent");
const message = document.getElementById("progress-message");

async function start() {
  try {
    const response = await fetch("data/classes.json");
    if (!response.ok) throw new Error("Impossible de charger data/classes.json.");
    const classes = await response.json();
    const db = await connectFirebase();
    onValue(ref(db, "boitesNoel/status"), snapshot => {
      const statuses = snapshot.val() || {};
      const done = Array.isArray(classes)
        ? classes.filter(item => statuses[item.id]?.completed === true).length
        : 0;
      const total = Array.isArray(classes) ? classes.length : 0;
      const ratio = total ? Math.min(100, Math.round(done / total * 100)) : 0;
      if (fill) fill.style.width = ratio + "%";
      if (count) count.textContent = `${done} / ${total} classes validées`;
      if (percent) percent.textContent = ratio + " %";
      if (message) message.textContent = done === total && total > 0
        ? "Toutes les classes ont été présentées. Bravo !"
        : done === 0
          ? "Les passages réalisés apparaîtront ici en temps réel."
          : "La progression est synchronisée pour tous les éco-délégués.";
    }, error => {
      if (message) message.textContent = "Impossible de lire la progression. Vérifiez les règles Firebase.";
      console.error(error);
    });
  } catch (error) {
    if (message) message.textContent = error.message;
    console.error(error);
  }
}

start();
