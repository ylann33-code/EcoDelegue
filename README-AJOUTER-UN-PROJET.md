# Ajouter un projet au site des éco-délégués

La liste des projets de l'accueil est chargée automatiquement depuis `data/projects.json`.

## Ajouter un projet simple

1. Crée une page HTML pour ton projet, par exemple `projet-etape-2.html`.
2. Ouvre `data/projects.json`.
3. Ajoute un objet dans le tableau `projects` :

```json
{
  "id": "nom-du-projet-etape-2",
  "title": "Nom du projet – Étape 2",
  "description": "Une phrase qui explique le projet.",
  "shortDescription": "Courte description affichée dans la carte Projets.",
  "page": "projet-etape-2.html",
  "icon": "leaf",
  "status": "À VENIR",
  "dates": "Dates à préciser"
}
```

Icônes disponibles : `gift`, `leaf` et `calendar`. Si l'icône est inconnue, une feuille sera affichée.

La propriété `featuredProjectId` indique le projet affiché dans le grand encadré en haut de l'accueil. Change sa valeur pour mettre un autre projet à la une.

Le projet Étape 1 utilise `"progressSource": "boitesNoel"` pour afficher son pourcentage de progression. N'ajoute pas cette propriété à un autre projet sauf si son fonctionnement est compatible.

## Projet avec des fonctionnalités particulières

Si ton projet a des cases à cocher, un formulaire ou un suivi en temps réel, crée sa propre page et ses fichiers JavaScript. Chaque projet doit avoir ses propres données Firebase : ne réutilise pas les données d'un autre projet.

## Prompt à donner à une IA

Copie ce prompt et joins-lui les fichiers du dépôt ou donne-lui accès au dépôt GitHub.

> Tu travailles sur le site Éco-délégués du collège Olympe de Gouges. Je veux ajouter un nouveau projet intitulé : [NOM DU PROJET].
>
> Lis d'abord README.md, README-AJOUTER-UN-PROJET.md, data/projects.json, index.html et js/home.js. Respecte le style et la navigation existants.
>
> Crée les fichiers nécessaires et ajoute le projet à data/projects.json pour qu'il apparaisse automatiquement sur l'accueil.
>
> Contraintes :
> - Ne supprime ni ne remplace aucun projet existant.
> - Ne modifie jamais data/classes.json ni le fonctionnement de l'Opération boîtes de Noël – Étape 1, sauf demande explicite.
> - Ne modifie pas les données Firebase existantes, les règles Firebase, la messagerie, le calendrier ou les documents si ce n'est pas indispensable.
> - N'ajoute pas de Cloud Functions, de service payant ou de dépendance.
> - Si Firebase est nécessaire, utilise un chemin de données distinct, par exemple projects/[identifiant-du-projet]/, et explique les règles éventuellement nécessaires sans les modifier automatiquement.
> - Utilise des chemins relatifs compatibles avec GitHub Pages.
> - Vérifie les syntaxes JSON et JavaScript, les liens et l'affichage mobile.
> - Ne change pas la page d'accueil autrement que pour l'ajout au catalogue, sauf nécessité expliquée.
>
> Termine par un résumé des fichiers créés/modifiés et des tests effectués. Si une information essentielle manque, pose une seule question précise au lieu de l'inventer.

## À retenir

Pour un projet simple, ajoute une page HTML puis une entrée dans `data/projects.json`. Pour un projet interactif, crée aussi son script et ses données séparées. Pour une grosse modification, crée une branche GitHub ou une copie de sauvegarde avant de commencer.
