# Tableau de bord des éco-délégués

Site statique prévu pour GitHub Pages. Les pages utilisent les fichiers HTML/CSS/JS du dépôt et conservent la connexion à Firebase Realtime Database existante.

## Pages
- `index.html` : tableau de bord.
- `calendrier.html` : calendrier Google intégré.
- `messagerie.html` : maquette uniquement, volontairement non fonctionnelle.
- `documents.html` : bibliothèque des documents déposés dans le dépôt.
- `boites-noel.html` : suivi des passages par classe, synchronisé avec Firebase.
- `admin.html` : accès provisoire aux réglages du contenu de l'accueil.

## Ajouter des documents
1. Déposez les fichiers dans `documents/` (par exemple `compte-rendu.pdf`).
2. Modifiez `documents/documents.json` et ajoutez une entrée :
   ```json
   [
     {
       "title": "Compte rendu de réunion",
       "date": "2026-10-12",
       "file": "compte-rendu.pdf",
       "description": "Compte rendu de la réunion d'octobre"
     }
   ]
   ```
3. Publiez les changements sur GitHub Pages. Les PDF peuvent être prévisualisés dans le site et téléchargés.

## Firebase
La configuration existante est conservée dans `js/firebase-config.js`. Le site utilise Firebase Authentication en connexion anonyme et Firebase Realtime Database. Vérifiez que la méthode de connexion anonyme est activée dans Firebase Console.

Les données utilisées :
- `boitesNoel/status/` : état des passages par classe (fonction historique conservée).
- `dashboard/content/` : textes modifiables depuis la page d'administration.

**Important : sécurité provisoire.** Le code `1234` est uniquement une porte d'entrée de démonstration côté navigateur. Il est visible dans le code source et ne protège pas réellement les données. De même, l'accès anonyme Firebase ne prouve pas qu'un utilisateur est administrateur. Avant toute utilisation réelle de l'administration, il faudra mettre en place Firebase Authentication avec de vrais comptes, des rôles contrôlés côté serveur (par exemple via custom claims) et des règles Realtime Database qui interdisent les écritures aux non-administrateurs. Les règles Firebase doivent également être vérifiées pour les écritures de suivi des boîtes de Noël.

## Publication
Publiez la racine du dépôt avec GitHub Pages. Ne renommez pas les chemins des dossiers `css/`, `js/`, `data/`, `documents/` et `icone/` sans adapter les références.


## Tester le site en local

Ne pas ouvrir directement `index.html` avec un double-clic (`file://`). Les modules JavaScript et les fichiers JSON sont alors bloqués par le navigateur (erreur CORS, origine `null`).

Depuis le dossier du site, lancer un serveur local :

```bash
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans le navigateur. Il faut une connexion Internet pour charger Firebase et Google Calendar.

## Liens utiles de l'accueil

La configuration se trouve dans `data/useful-links.json`. Par défaut, `enabled` vaut `false`, donc la section reste vide. Pour afficher les liens, passer `enabled` à `true` et ajouter des objets contenant `title` et `url` dans `links`.

## Logos

`icone/logo-college.png` est le logo du collège et `icone/logo-ecodelegues.png` est le fichier réservé au futur logo des éco-délégués. Les deux fichiers contiennent actuellement la même image.

## Annonces sécurisées (V7)

La publication des annonces passe par une Firebase Cloud Function côté serveur. Voir `README-ANNONCES-SECURISEES.md` pour le déploiement, les règles Realtime Database et la configuration du code de publication. Le déploiement des Cloud Functions peut nécessiter le plan Blaze.


Pour configurer le code des annonces avec Realtime Database uniquement, consulte `README-MOT-DE-PASSE.md`.


## Icônes des projets

Les icônes des cartes de projets sont dessinées en SVG dans `projectIcons`, dans `js/home.js`. Pour choisir une icône, indiquez son identifiant dans le champ `icon` de l'objet correspondant dans `data/projects.json`.

| Identifiant | Description |
|---|---|
| `gift` | Un cadeau, pour les collectes et les dons. |
| `leaf` | Une feuille, pour les projets écologiques. |
| `calendar` | Un calendrier, pour les événements et les dates importantes. |
| `sprout` | Une jeune pousse, pour le jardinage et la nature. |
| `recycle` | Le symbole du recyclage, pour le tri et la récupération. |
| `globe` | Un globe terrestre, pour les projets liés à la planète. |
| `water` | Une goutte d'eau, pour les projets autour de l'eau. |
| `sun` | Un soleil, pour l'énergie solaire. |
| `wind` | Le vent, pour les énergies renouvelables. |
| `tree` | Un arbre, pour les plantations et la biodiversité. |
| `flower` | Une fleur, pour les plantes et les insectes. |
| `bike` | Un vélo, pour les déplacements écologiques. |
| `school` | Une école, pour les projets concernant le collège. |
| `heart` | Un cœur, pour les projets solidaires. |
| `hands` | Des mains, pour l'entraide et la solidarité. |
| `book` | Un livre, pour l'éducation et la sensibilisation. |
| `bottle` | Une bouteille, pour les collectes de contenants. |
| `trash` | Une poubelle, pour le nettoyage et la réduction des déchets. |
| `food` | Un aliment, pour les projets autour de l'alimentation. |
| `community` | Un groupe de personnes, pour les projets collectifs. |
| `seed` | Une graine, pour les plantations et la végétalisation. |

Exemple dans `data/projects.json` :

```json
{
  "icon": "sprout"
}
```

## Dates des projets

Le champ `visibleFrom` définit le premier jour où la carte d'un projet apparaît sur l'accueil. Le champ `editableUntil` définit le dernier jour où les modifications sont autorisées. La date de fin est incluse : le projet reste modifiable toute cette journée (heure de Paris), puis passe en consultation uniquement le lendemain.

Exemple :

```json
{
  "visibleFrom": "2026-11-29",
  "editableUntil": "2026-12-12"
}
```

Pour l'opération boîtes de Noël 2026, l'étape 1 est modifiable jusqu'au 28 novembre inclus et l'étape 2 jusqu'au 12 décembre inclus.
