import { connectFirebase, ref, onValue } from "./firebase.js";

const fill = document.getElementById("progress-fill");
const count = document.getElementById("progress-count");
const percent = document.getElementById("progress-percent");
const message = document.getElementById("progress-message");

async function start() {
  try {
    const db = await connectFirebase();
    onValue(ref(db, "boitesNoel/status"), snapshot => {
      const data = snapshot.val() || {};
      const done = Object.values(data).filter(item => item && item.completed === true).length;
      const total = 20;
      const ratio = Math.min(100, Math.round(done / total * 100));
      fill.style.width = ratio + "%";
      count.textContent = `${done} / ${total} classes validées`;
      percent.textContent = ratio + " %";
      message.textContent = done === total ? "Toutes les classes ont été présentées. Bravo !" :
        done === 0 ? "Les passages réalisés apparaîtront ici en temps réel." :
        "La progression est synchronisée pour tous les éco-délégués.";
    }, error => {
      message.textContent = "Impossible de lire la progression. Vérifiez les règles Firebase.";
      console.error(error);
    });
  } catch (error) {
    message.textContent = error.message;
    console.error(error);
  }
}
start();
