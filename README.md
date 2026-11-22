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
