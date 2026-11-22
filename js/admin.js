
import {connectFirebase,ref,onValue,set} from "./firebase.js";
const $=id=>document.getElementById(id);
const CODE="1234"; // Code temporaire de démonstration : à remplacer par Firebase Authentication + règles serveur.
let db=null;
const fields={projectTitle:"project-title-input",projectDescription:"project-description-input",projectDates:"project-dates-input",welcomeTitle:"welcome-title-input",welcomeText:"welcome-text-input"};
function showPanel(){ $("login-card").classList.add("hidden");$("admin-panel").classList.remove("hidden");}
$("login-form").addEventListener("submit",async e=>{
 e.preventDefault();
 if($("admin-code").value!==CODE){$("login-status").textContent="Code incorrect.";return}
 try{
  db=await connectFirebase();showPanel();$("login-status").textContent="";
  onValue(ref(db,"dashboard/content"),snap=>{const data=snap.val()||{};for(const [key,id] of Object.entries(fields))$(id).value=data[key]||"";});
 }catch(err){$("login-status").textContent="Connexion Firebase impossible : "+err.message}
});
$("content-form").addEventListener("submit",async e=>{
 e.preventDefault();if(!db)return;
 const data={};for(const [key,id] of Object.entries(fields))data[key]=$(id).value.trim();
 $("save-status").textContent="Enregistrement…";
 try{await set(ref(db,"dashboard/content"),data);$("save-status").textContent="Modifications enregistrées."}
 catch(err){$("save-status").textContent="Échec de l’enregistrement. Vérifiez les règles Firebase.";console.error(err)}
});
$("logout-button").addEventListener("click",()=>{$("admin-panel").classList.add("hidden");$("login-card").classList.remove("hidden");$("admin-code").value="";db=null});
