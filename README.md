# Dashboard des éco-délégués — Collège Olympe de Gouges

Site statique prévu pour GitHub Pages, avec progression partagée grâce à Firebase Realtime Database.

## 1. Fichiers à modifier

- `data/classes.json` : les 20 classes, dates, heures, salles et prénoms.
- `js/firebase-config.js` : configuration de votre projet Firebase.
- `icone/logo-college.png` : remplacez ce fichier par le logo du collège (PNG conseillé). Le même fichier sert de logo dans l'en-tête et de favicon dans l'onglet du navigateur.

Les classes déjà renseignées :
- 6e A : 24 novembre 2026 à 13h, salle 1011 — Jeanne et Roxane.
- 6e B : 27 novembre 2026 à 16h, salle 111 — Lila et Emma.
- 6e C : 23 novembre 2026 à 11h30, salle 214 — Éloïse et Roxane.

Les autres entrées sont volontairement laissées vides. Conservez les identifiants (`6A`, `6B`, etc.).

## 2. Créer Firebase

1. Ouvrez https://console.firebase.google.com/ et créez un projet.
2. Dans les paramètres du projet, ajoutez une application Web (icône `</>`). Le nom est libre.
3. Copiez la configuration du SDK affichée et remplacez les valeurs `REMPLACER_...` dans `js/firebase-config.js`.
4. Dans **Build > Authentication > Sign-in method**, activez **Anonymous**.
5. Dans **Build > Realtime Database**, créez une base de données. Choisissez une région proche, idéalement Europe.
6. Copiez l'URL de la base (champ `databaseURL`) dans `js/firebase-config.js`. L'URL exacte est fournie par Firebase ; elle peut se terminer par `europe-west1.firebasedatabase.app` ou `firebaseio.com`.
7. Dans l'onglet **Règles** de Realtime Database, collez les règles ci-dessous puis cliquez sur Publier.

### Règles Realtime Database

```json
{
  "rules": {
    "boitesNoel": {
      "status": {
        ".read": "auth != null",
        ".write": "auth != null",
        "$classId": {
          ".validate": "($classId === '6A' || $classId === '6B' || $classId === '6C' || $classId === '6D' || $classId === '6E' || $classId === '6F' || $classId === '5A' || $classId === '5B' || $classId === '5C' || $classId === '5D' || $classId === '5E' || $classId === '4A' || $classId === '4B' || $classId === '4C' || $classId === '4D' || $classId === '4E' || $classId === '3A' || $classId === '3B' || $classId === '3C' || $classId === '3D') && newData.hasChildren(['completed', 'updatedAt']) && newData.child('completed').isBoolean() && newData.child('updatedAt').isNumber()"
        }
      }
    }
  }
}
```

**Important :** cette première version utilise la connexion anonyme Firebase. Elle évite de demander un compte à chaque élève, mais toute personne qui connaît l'adresse du site peut potentiellement ouvrir le site et obtenir une session anonyme pour modifier les cases. Ce n'est donc pas une authentification réservée aux seuls éco-délégués. Pour un usage interne plus verrouillé, il faudra ajouter une vraie connexion (par exemple Google) et des règles limitant les utilisateurs autorisés.

## 3. Tester en local

Ne double-cliquez pas sur `index.html` : le navigateur peut bloquer le chargement du JSON et des modules JavaScript. Utilisez un petit serveur local, ou publiez directement sur GitHub Pages.

## 4. Publier sur GitHub Pages

1. Créez un dépôt GitHub, par exemple `eco-delegues`.
2. Déposez **le contenu** du dossier `EcoDelegues` à la racine du dépôt (pas le dossier parent).
3. Sur GitHub : **Settings > Pages**.
4. Dans **Build and deployment**, choisissez **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
5. Attendez la publication et ouvrez l'adresse GitHub Pages affichée.

Si vous utilisez un dépôt de projet, le site sera généralement à l'adresse `https://VOTRE-PSEUDO.github.io/eco-delegues/`.

## 5. Agenda Google

L'intégration fournie est conservée avec l'affichage `mode=MONTH` pour afficher le mois. Si l'agenda est vide pour les visiteurs, ouvrez les paramètres Google Agenda et vérifiez que le calendrier est partagé avec les personnes qui doivent le consulter. Ne rendez pas public un agenda contenant des informations personnelles ou sensibles.

## 6. Ajouter les autres dates

Dans `data/classes.json`, chaque entrée suit ce format :

```json
{
  "id": "5A",
  "name": "5e A",
  "date": "2026-11-25",
  "time": "14:00",
  "room": "204",
  "people": ["Prénom 1", "Prénom 2"]
}
```

- Date au format `AAAA-MM-JJ`.
- Heure au format `HH:MM`.
- Pour une information inconnue, laissez `date` et `time` à `null`, `room` vide et `people` vide.
- Respectez les virgules et les guillemets du JSON.

## Fonctionnement des validations

Les horaires et les noms viennent du JSON (lecture seule côté site). Seul l'état « terminée / à faire » est enregistré dans Firebase. Quand une case est cochée, tous les appareils connectés reçoivent la mise à jour en temps réel.
