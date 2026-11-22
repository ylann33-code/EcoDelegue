
import {icon} from "./ui.js";
const list=document.getElementById("document-list"),search=document.getElementById("document-search");
const viewer=document.getElementById("pdf-viewer"),frame=document.getElementById("pdf-frame");
let docs=[];
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function render(){
 const q=search.value.trim().toLocaleLowerCase("fr");
 const filtered=docs.filter(d=>(d.title+" "+(d.description||"")).toLocaleLowerCase("fr").includes(q));
 if(!filtered.length){list.innerHTML='<div class="empty">Aucun document pour le moment.</div>';return}
 list.innerHTML=filtered.map(d=>{
  const path="documents/"+String(d.file||"").split("/").map(encodeURIComponent).join("/");
  const ext=(String(d.file||"").split(".").pop()||"").toLowerCase();
  const view=ext==="pdf"?`<button class="button" type="button" data-preview="${path}" data-title="${esc(d.title)}">Consulter le PDF</button>`:"";
  return `<article class="document-card"><span class="doc-icon">${icon("folder")}</span><div><strong>${esc(d.title)}</strong><small>${esc(d.date||"")} ${d.description?"· "+esc(d.description):""}</small></div>${view}<a class="button" href="${path}" download>Télécharger ${icon("download")}</a></article>`;
 }).join("");
}
async function init(){
 try{const r=await fetch("documents/documents.json");if(!r.ok)throw Error("Le fichier documents/documents.json est introuvable.");docs=await r.json();if(!Array.isArray(docs))throw Error("Le catalogue des documents est invalide.");render()}
 catch(e){list.innerHTML=`<div class="empty">${esc(e.message)}</div>`}
}
search.addEventListener("input",render);
list.addEventListener("click",e=>{
 const button=e.target.closest("[data-preview]");
 if(!button)return;
 const path=button.dataset.preview;
 const title=button.dataset.title||"Aperçu du document";
 document.getElementById("pdf-title").textContent=title;
 frame.src=path;
 if(typeof viewer.showModal==="function") viewer.showModal();
});
document.getElementById("close-viewer").addEventListener("click",()=>{viewer.close();frame.src="about:blank"});viewer.addEventListener("click",e=>{if(e.target===viewer){viewer.close();frame.src="about:blank"}});init();
