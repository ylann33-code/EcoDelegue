import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getDatabase, ref, onValue, get, set, push, query, orderByChild } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js";
import { firebaseConfig } from "./firebase-config.js";

export const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export async function connectFirebase() {
  if (firebaseConfig.apiKey.startsWith("REMPLACER_") || firebaseConfig.projectId.startsWith("REMPLACER_")) {
    throw new Error("La configuration Firebase n'a pas encore été renseignée dans js/firebase-config.js.");
  }
  await signInAnonymously(auth);
  return db;
}
export { ref, onValue, get, set, push, query, orderByChild };
