
export const icons = {"home": "<path d=\"m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z\"/>", "calendar": "<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\"/><path d=\"M16 3v4M8 3v4M3 10h18\"/>", "message": "<path d=\"M4 5h16v11H9l-5 4z\"/><path d=\"M8 10h.01M12 10h.01M16 10h.01\"/>", "folder": "<path d=\"M3 6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "settings": "<path d=\"M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z\"/><path d=\"m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1 0 1.9Z\"/>", "leaf": "<path d=\"M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-7 11-16Z\"/><path d=\"M3 21c4-6 8-9 14-13\"/>", "arrow": "<path d=\"M5 12h14m-6-6 6 6-6 6\"/>", "megaphone": "<path d=\"m3 11 14-6v14L3 13z\"/><path d=\"M7 14l2 6h4l-2-5M20 9l2-2m-2 8 2 2\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"9\"/><path d=\"M12 11v5m0-8h.01\"/>", "download": "<path d=\"M12 3v12m-5-5 5 5 5-5M4 20h16\"/>", "star": "<path d=\"m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z\"/>", "chevron": "<path d=\"m9 18 6-6-6-6\"/>"};
export function icon(name, cls="") {
 const paths=icons[name]||"";
 return `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;
}
export function setActive(page) {
 document.querySelectorAll(".side-link").forEach(a=>a.classList.remove("active"));
 const link=document.querySelector(`[data-page="${page}"]`); if(link) link.classList.add("active");
}
